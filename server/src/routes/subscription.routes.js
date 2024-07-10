import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJWT);

subscriptionRouter.get("/toggleSubscription", toggleSubscription);

subscriptionRouter.get("/subscriberList", getUserChannelSubscribers);

subscriptionRouter.get("/subscribedChannelList", getSubscribedChannels);

export default subscriptionRouter;