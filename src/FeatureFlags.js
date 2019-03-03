import logger from './server/Logger';

export default class FeatureFlags {
    constructor(config) {
        this.config = config ? config : FeatureFlags.createDefaults();
    }

    static createDefaults() {
        logger.info(
            `Initializing feature flags with env '${process.env.NODE_ENV}'`
        );

        return {
            debug:
                !process.env.NODE_ENV || process.env.NODE_ENV == 'development'
        };
    }

    isDebug() {
        return this.config['debug'] ? true : false;
    }
}
