import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: { persistSession: false },
  }
);

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private publicBucket = "profile-photos"; // Public bucket for profile images
  private privateBucket = "private-files"; // Private bucket for documents

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    if (!process.env.SUPABASE_URL) {
      throw new Error("SUPABASE_URL environment variable is not set");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
    }
  }

  /**
   * Get a presigned upload URL for direct client upload
   * Returns both the URL and the object path for reference
   */
  async getObjectEntityUploadURL(): Promise<string> {
    try {
      const fileName = `${Date.now()}-${randomUUID()}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.publicBucket)
        .createSignedUploadUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        throw new Error(`Failed to generate upload URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Error generating upload URL:", error);
      throw error;
    }
  }

  /**
   * Normalize object path for Supabase
   */
  normalizeObjectEntityPath(uploadURL: string): string {
    try {
      const url = new URL(uploadURL);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/[^/]+\/([^?]+)/);
      return pathMatch ? pathMatch[1] : uploadURL;
    } catch {
      return uploadURL;
    }
  }

  /**
   * Get file metadata and download stream
   */
  async getObjectEntityFile(objectPath: string): Promise<Blob> {
    try {
      const normalizedPath = objectPath.replace(/^\/objects\//, "");

      const { data, error } = await supabase.storage
        .from(this.privateBucket)
        .download(normalizedPath);

      if (error) {
        if (error.message.includes("not found")) {
          throw new ObjectNotFoundError();
        }
        throw new Error(`Failed to download file: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof ObjectNotFoundError) throw error;
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Search for public objects across search paths
   */
  async searchPublicObject(filePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.publicBucket)
        .list("uploads", {
          limit: 1,
          search: filePath,
        });

      if (error) {
        console.error("Error searching for public object:", error);
        return null;
      }

      if (data && data.length > 0) {
        return `uploads/${filePath}`;
      }

      return null;
    } catch (error) {
      console.error("Error searching public object:", error);
      return null;
    }
  }

  /**
   * Get public URL for an object
   */
  getPublicObjectUrl(objectPath: string): string {
    try {
      const normalizedPath = objectPath.replace(/^\//, "");
      const { data } = supabase.storage.from(this.publicBucket).getPublicUrl(normalizedPath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting public URL:", error);
      throw error;
    }
  }

  /**
   * Download object as Response
   */
  async downloadObject(objectPath: string, cacheTtlSec: number = 3600): Promise<Response> {
    try {
      const normalizedPath = objectPath.replace(/^\//, "");

      const { data, error } = await supabase.storage
        .from(this.publicBucket)
        .download(normalizedPath);

      if (error) {
        if (error.message.includes("not found")) {
          return new Response("Not found", { status: 404 });
        }
        throw error;
      }

      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": data.type || "application/octet-stream",
          "Cache-Control": `public, max-age=${cacheTtlSec}`,
          "Content-Length": data.size.toString(),
        },
      });
    } catch (error) {
      console.error("Error downloading object:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  /**
   * Delete an object
   */
  async deleteObject(objectPath: string, isPublic: boolean = true): Promise<void> {
    try {
      const normalizedPath = objectPath.replace(/^\//, "");
      const bucket = isPublic ? this.publicBucket : this.privateBucket;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([normalizedPath]);

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  }

  /**
   * Upload file directly (admin operation)
   */
  async uploadObject(
    objectPath: string,
    fileData: Buffer | Blob,
    isPublic: boolean = true
  ): Promise<string> {
    try {
      const normalizedPath = objectPath.replace(/^\//, "");
      const bucket = isPublic ? this.publicBucket : this.privateBucket;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(normalizedPath, fileData, { upsert: true });

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      if (isPublic) {
        return this.getPublicObjectUrl(data.path);
      }

      return data.path;
    } catch (error) {
      console.error("Error uploading object:", error);
      throw error;
    }
  }
}

export const objectStorageService = new ObjectStorageService();
