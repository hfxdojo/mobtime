/* eslint-disable prefer-arrow-callback */

import formatTime from './formatTime.js';
import * as port from './port.js';

const fx = effect => props => [effect, props];

const sendMessage = (websocketPort, type, json = {}) => {
  port.expose(websocketPort).send({
    ...json,
    type,
  });
};

export const UpdateSettings = fx(function UpdateSettingsFX(
  _dispatch,
  { websocketPort, settings },
) {
  return sendMessage(websocketPort, 'settings:update', { settings });
});

export const BroadcastJoin = fx(function UpdateSettingsFX(
  _dispatch,
  { websocketPort },
) {
  return sendMessage(websocketPort, 'client:new');
});

export const StartTimer = fx(function StartTimerFX(
  _dispatch,
  { websocketPort, timerDuration },
) {
  return sendMessage(websocketPort, 'timer:start', { timerDuration });
});

export const PauseTimer = fx(function StartTimerFX(
  _dispatch,
  { websocketPort, timerDuration },
) {
  return sendMessage(websocketPort, 'timer:pause', { timerDuration });
});

export const CompleteTimer = fx(function CompleteTimerFX(
  _dispatch,
  { websocketPort },
) {
  return sendMessage(websocketPort, 'timer:complete');
});

export const UpdateGoals = fx(function UpdateGoalsFX(
  _dispatch,
  { websocketPort, goals },
) {
  return sendMessage(websocketPort, 'goals:update', { goals });
});

export const UpdateMob = fx(function UpdateMobFX(
  _dispatch,
  { websocketPort, mob },
) {
  console.log('effects.updateMob', { websocketPort, mob });
  return sendMessage(websocketPort, 'mob:update', { mob });
});

export const NotificationPermission = fx(function NotificationPermissionFX(
  dispatch,
  { SetNotificationPermissions, Notification, documentElement },
) {
  const dispatchSetNotificationPermissions = notificationPermissions => {
    dispatch(SetNotificationPermissions, {
      notificationPermissions,
      Notification,
      documentElement,
    });
  };

  if (!Notification) {
    dispatchSetNotificationPermissions('denied');
    return;
  }

  Notification.requestPermission()
    .then(dispatchSetNotificationPermissions)
    .catch(() => {
      // eslint-disable-next-line no-console
      dispatchSetNotificationPermissions('denied');
    });
});

export const Notify = fx(function NotifyFX(
  _dispatch,
  {
    title,
    text,
    notification = true,
    sound = false,
    Notification,
    documentElement,
  },
) {
  if (notification && Notification) {
    // eslint-disable-next-line no-new
    new Notification(title, {
      body: text,
      vibrate: [100, 100, 100],
    });
  }
  if (sound && documentElement) {
    const timerComplete = documentElement.querySelector('#timer-complete');
    timerComplete.play();
  }
});

export const UpdateTitleWithTime = fx(function UpdateTitleWithTimeFX(
  _dispatch,
  { remainingTime, documentElement },
) {
  // eslint-disable-next-line no-param-reassign
  documentElement.title =
    remainingTime > 0 ? `${formatTime(remainingTime)} - mobtime` : 'mobtime';
});

export const andThen = fx(function andThenFX(dispatch, { action, props }) {
  dispatch(action, props);
});

export const LoadProfile = fx(function LoadProfileFx(
  dispatch,
  { localStorage, onLoad },
) {
  const profileString = localStorage.getItem('mobtime_profile');
  const profile = profileString
    ? JSON.parse(profileString)
    : {
        firstTime: true,
        name: 'Anonymous Mobber',
        avatar: null,
        id: Math.random()
          .toString(36)
          .slice(2),
      };

  if (!profileString) {
    localStorage.setItem(
      'mobtime_profile',
      JSON.stringify({ ...profile, firstTime: false }),
    );
  }

  dispatch(onLoad, profile);
});
