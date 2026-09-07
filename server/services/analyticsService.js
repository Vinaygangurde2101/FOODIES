/**
 * Lightweight Analytics Abstraction Service for Naik Foods SmartShop
 * 
 * Provides event tracking functionality across key conversion funnel checkpoints.
 * Designed to seamlessly plug into real third-party providers (e.g., Mixpanel, Segment, Google Analytics 4, PostHog).
 */

const trackEvent = (eventName, eventData = {}, userContext = null) => {
  const payload = {
    timestamp: new Date().toISOString(),
    event: eventName,
    data: eventData,
    userId: userContext ? userContext._id || userContext.id : 'guest',
    environment: process.env.NODE_ENV || 'development'
  };

  // Log in development console cleanly
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ANALYTICS EVENT] ${eventName}:`, JSON.stringify(eventData));
  }

  /**
   * INTEGRATION SPOT FOR PRODUCTION ANALYTICS PLATFORMS:
   * 
   * Example Segment / Mixpanel Integration:
   * if (process.env.MIXPANEL_TOKEN) {
   *   mixpanel.track(eventName, payload);
   * }
   */

  return payload;
};

module.exports = {
  trackEvent
};
