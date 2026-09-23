// Higher number = higher priority
const TIER_WEIGHT = {
  urgent: 2,
  normal: 1
};

/**
 * Sorts appointments using Hybrid Priority Queue + EDF.
 * Primary sort: priorityTier (urgent before normal)
 * Tie-break: preferredDate (soonest deadline first) — this is the EDF part
 */
const sortQueue = (appointments) => {
  return [...appointments].sort((a, b) => {
    const tierDiff = TIER_WEIGHT[b.priorityTier] - TIER_WEIGHT[a.priorityTier];
    if (tierDiff !== 0) return tierDiff; // different tiers -> tier wins

    // same tier -> earlier deadline wins (ascending date)
    return new Date(a.preferredDate) - new Date(b.preferredDate);
  });
};

/**
 * Adds queue position + estimated wait time to each appointment,
 * using each service's avgDurationMins as the "cost" of everyone ahead in line.
 */
const buildQueueView = (sortedAppointments) => {
  let cumulativeMinutes = 0;

  return sortedAppointments.map((appt, index) => {
    const estimatedWaitMins = cumulativeMinutes;
    cumulativeMinutes += appt.service?.avgDurationMins || 0;

    return {
      position: index + 1,
      estimatedWaitMins,
      appointment: appt
    };
  });
};

module.exports = { sortQueue, buildQueueView };