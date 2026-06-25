const PROFILE_SETTINGS_FIELDS = ['avatar', 'parentPin', 'username'];
const USER_PREFERENCES_FIELDS = ['language', 'theme'];

const omitUndefinedFields = (patch) => {
  if (!patch || typeof patch !== 'object') return {};

  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
};

const pickAllowedFields = (source, allowedFields) => {
  if (!source || typeof source !== 'object') return {};

  return allowedFields.reduce((accumulator, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      accumulator[field] = source[field];
    }

    return accumulator;
  }, {});
};

export const buildLanguagePreferencePatch = (language) => (
  omitUndefinedFields({ language })
);

export const buildThemePreferencePatch = (theme) => (
  omitUndefinedFields({ theme })
);

export const buildParentPinPatch = (parentPin) => (
  omitUndefinedFields({ parentPin })
);

export const buildUsernamePatch = (username) => (
  omitUndefinedFields({ username })
);

export const buildAvatarPatch = (avatar) => (
  omitUndefinedFields({ avatar })
);

export const buildProfileSettingsPatch = (settingsPatch) => (
  omitUndefinedFields(pickAllowedFields(settingsPatch, PROFILE_SETTINGS_FIELDS))
);

export const buildUserPreferencesPatch = (preferencesPatch) => (
  omitUndefinedFields(pickAllowedFields(preferencesPatch, USER_PREFERENCES_FIELDS))
);
