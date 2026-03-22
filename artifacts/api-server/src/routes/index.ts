import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import discoveryRouter from "./discovery";
import swipesRouter from "./swipes";
import matchesRouter from "./matches";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import storageRouter from "./storage";
import likedRouter from "./liked";
import collegesRouter from "./colleges";
import verificationRouter from "./verification";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profiles", profilesRouter);
router.use("/discovery", discoveryRouter);
router.use("/swipes", swipesRouter);
router.use("/matches", matchesRouter);
router.use("/matches", messagesRouter);
router.use("/notifications", notificationsRouter);
router.use("/liked", likedRouter);
router.use("/colleges", collegesRouter);
router.use("/verification", verificationRouter);
router.use("/admin", adminRouter);
router.use(storageRouter);

export default router;
