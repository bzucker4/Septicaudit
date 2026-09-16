# Live Tally webhook field keys (from SA-2026-7012 / response dbpzJJd)

These are the `field.key` values on the webhook payload — NOT form-definition UUIDs.

## Contact / location / ledger / parcel
| Mapper key | Label | Live key |
| --- | --- | --- |
| contactName | Contact Name | question_vxXaQg |
| contactEmail | Contact Email | question_KBp4qg |
| contactPhone | Contact Phone | question_LMDjQy |
| contactRole | Your role | question_pPeNl1 |
| county | WNY County | question_12WY1g |
| purpose | What brings you to the ledger? | question_Md129l |
| occupancy | How many people live there most weeks? | question_Jk1rNr |
| age | About how old is the system? | question_gNbVRP |
| type | What kind of system is in the ground? | question_yqXbW8 |
| pump | When was the tank last pumped? | question_XB57KP |
| inspect | When was it last opened by a professional? | question_8pNY0l |
| symptoms | What are you seeing or smelling? | question_0jVYp9 |
| habits | What goes down the drains besides ordinary use? | question_zQEAak |
| site | What sits near the system? | question_5qXYyN |
| parcelId | Parcel / tax map ID | question_d2bo5r |

## Service log
| Mapper key | Label | Live key |
| --- | --- | --- |
| address | Property Address | question_VMxorl |
| cityStateZip | City, State, ZIP | question_PXP8o0 |
| tankSize | Tank Size | question_EJa8pL |
| gallons | Gallons Pumped | question_rdq2XL |
| notes | Observations / Notes | question_4oGPZo |
| photos | Attach Site Photos | question_j7EGK9 |
| acknowledgment | Acknowledgment | question_2JRO2b |

Note: checkbox option rows may append `_<uuid>` to the parent key; matcher should exact-match parent key OR startswith `parent_`.
