/**
 * RSVP Properties [Notion Column Names]:
 * key: the reference key for the property (custom)
 * type: the data type of the property (Notion API)
 *
 * Since key doesn't work for all properties... (rah! we added these hardcoded values from Notion)
 */

export const RSVP_PROPERTIES = {
  // "Dietary Restrictions": {
  //   key: "dietRestrictions",
  //   type: "rich_text",
  // },
  "First Name": {
    key: "firstName",
    type: "title",
  },
  "Last Name": {
    key: "lastName",
    type: "rich_text",
  },
  // "Meal Preference": {
  //   key: "mealPreference",
  //   type: "select",
  // },
  "Plus Ones": {
    key: "related",
    type: "relation",
  },
  // "RSVP Status": {
  //   key: "rsvpStatus",
  //   type: "select",
  // },
  // "Sandwich Request": {
  //   key: "sandwichRequest",
  //   type: "select",
  // },
  // "Shuttle Count": {
  //   key: "shuttleCount",
  //   type: "select",
  // },
  // "Song Request": {
  //   key: "songRequest",
  //   type: "rich_text",
  // },
  // "Artist of Song Request": {
  //   key: "artistOfSongRequest",
  //   type: "select",
  // },
  // "Sunday Picnic RSVP": {
  //   key: "sundayPicnicRSVP",
  //   type: "select",
  // },
};
