/**
 * PalmShield State
 * Single source of truth for runtime state.
 */

const state = {
  wallet:         null,
  walletShort:    null,
  role:           null,
  snsName:        null,   // current user's own .sol name if claimed
  snsCache:       {},     // { walletAddress: 'name.sol' } for all loaded users
  submissions:    [],
  myVotes:        {},
  daoVotesCast:   0,
  hunterBalance:  0,
  selectedThreat: null,
  bountyAmt:      250,
  uploadedFile:   null,
  uploadedImage:  null,
  activeModal:    null,
};
