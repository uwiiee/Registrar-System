const { sortQueue, buildQueueView } = require('./src/utils/queueEngine');

const sample = [
  { _id: '1', priorityTier: 'normal', preferredDate: '2026-09-20', service: { avgDurationMins: 15 } },
  { _id: '2', priorityTier: 'urgent', preferredDate: '2026-09-22', service: { avgDurationMins: 10 } },
  { _id: '3', priorityTier: 'normal', preferredDate: '2026-09-18', service: { avgDurationMins: 20 } },
  { _id: '4', priorityTier: 'urgent', preferredDate: '2026-09-19', service: { avgDurationMins: 5 } },
];

const sorted = sortQueue(sample);
const view = buildQueueView(sorted);

console.log(view.map(v => ({
  position: v.position,
  id: v.appointment._id,
  tier: v.appointment.priorityTier,
  wait: v.estimatedWaitMins
})));