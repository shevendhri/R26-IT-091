# ICTAD Rule Coverage

Source document: `ICTAD- FIRE REGULATION (1).pdf`

This matrix records only rules codified from readable ICTAD source text in the repository. It does not claim full ICTAD coverage.

| Rule ID | Chapter | Regulation | Title | Coverage Status | Required Inputs | Source Page(s) | Test Coverage | Notes |
|---|---:|---|---|---|---|---|---|---|
| CH2-EXITS-STOREY-COUNT | 2 | Reg.3(9) | Two exits from each storey | VERIFIED_AND_IMPLEMENTED | building use, storey count, confirmed exits/stairs, independence evidence | 25 | `test_low_rise_integration_not_applicable_for_height_features`, exit-count behavior through integration | Produces `MANUAL_REVIEW` when independence/remoteness cannot be confirmed. |
| CH2-ROOM-EXIT-COUNT-TABLE4 | 2 | Reg.3(8), Table 4 | Rooms exceeding Table 4 load need two exits | VERIFIED_BUT_NOT_IMPLEMENTED | room occupancy type, occupant load, exit-door count, remoteness | 24-25 | generic unresolved/manual behavior | Table values are centralized, but current schema does not yet normalize per-room occupant load and confirmed exit count. |
| CH2-TRAVEL-DISTANCE-TABLE5 | 2 | Reg.2(c), Reg.3, Table 5 | Maximum travel distance | VERIFIED_BUT_NOT_IMPLEMENTED | occupancy type, sprinkler condition, escape arrangement, valid route distance | 20, 30-31 | `test_travel_distance_known_and_unknown` | Limits are centralized. Evaluation remains `MANUAL_REVIEW` until geometry provides valid traversable travel distance. |
| CH2-SMOKE-FREE-STAIR-APPROACH | 2 | Reg.3(12), Reg.3(14) | Smoke-free approach to protected staircase | VERIFIED_AND_IMPLEMENTED | height, purpose group, stair approach evidence | 26-28 | medium/high-rise feature behavior | Presence evidence is read from `project.smoke_free_stair_approach`; unknown remains `MANUAL_REVIEW`. |
| CH2-STAIR-PRESSURIZATION-HIGHRISE | 2 | Reg.3(13) | High-rise escape stair pressurization | VERIFIED_AND_IMPLEMENTED | high-rise status, pressurization evidence | 27 | high-rise trigger behavior | Detailed pressure/velocity design criteria require specialist documentation. |
| CH2-EXIT-DOOR-SWING | 2 | Reg.4(8) | Exit door swing direction | VERIFIED_AND_IMPLEMENTED | confirmed exit doors, swing direction | 34 | `test_exit_door_width_height_and_swing_pass`, `test_confirmed_bad_exit_door_violates_boundaries` | Applies only to `door.is_exit is True`. |
| CH2-EXIT-DOOR-WIDTH | 2 | Reg.4(8)(b) | Minimum exit door clear width | VERIFIED_AND_IMPLEMENTED | confirmed exit doors, clear width | 34 | boundary and unknown-role tests | Minimum clear width: 1 m. Unknown exit role does not violate. |
| CH2-EXIT-DOOR-HEIGHT | 2 | Reg.4(8)(b) | Minimum exit door clear height | VERIFIED_AND_IMPLEMENTED | confirmed exit doors, clear height | 34 | boundary and unknown-role tests | Minimum clear height: 2000 mm. Unknown exit role does not violate. |
| CH2-EXIT-LIGHTING | 2 | Reg.5(1)-Reg.5(3) | Exit lighting | VERIFIED_AND_IMPLEMENTED | building type, lighting evidence, emergency power trigger | 35 | integration/manual review behavior | Emergency power count trigger remains manual where light count is unknown. |
| CH2-EXIT-SIGNAGE | 2 | Reg.6(1)-Reg.6(3) | Exit and directional signs | VERIFIED_AND_IMPLEMENTED | purpose group, signage evidence | 35 | integration/manual review behavior | Purpose Group 1 and 2(b) exceptions are encoded. |
| CH4-WET-RISING-MAIN | 4 | Reg.32(1) | Wet rising mains | VERIFIED_AND_IMPLEMENTED | highest storey floor level, wet rising main evidence | 70 | `test_wet_riser_height_trigger_boundaries`, `test_wet_riser_unknown_is_not_false_violation` | Required above 18 m; unknown presence gives `MANUAL_REVIEW`. |
| CH4-RISING-MAIN-QUANTITY | 4 | Reg.32(2)(a) | Rising main quantity | VERIFIED_AND_IMPLEMENTED | floors above 18 m, floor area of each applicable storey, observed count | 70 | `test_rising_main_quantity_calculates_only_with_applicable_floor_areas` | Calculates `ceil(area/900)` per applicable storey only when those floors are explicitly provided. |
| CH4-HOSE-REEL | 4 | Reg.33(1)-Reg.33(4) | Hydraulic hose reels | VERIFIED_AND_IMPLEMENTED | storey count, use, height, area, hose reel evidence | 72 | `test_hose_reel_pg1_exception_and_required_quantity` | Minimum one per storey where exceptions do not apply; coverage still requires verification. |
| CH4-FIRE-LIFT | 4 | Reg.34(1) | Fire lift | VERIFIED_AND_IMPLEMENTED | highest storey floor level, fire lift evidence | 72 | `test_fire_lift_threshold` | Required where any storey floor level exceeds 30 m. |
| CH4-FIREFIGHTING-SHAFT | 4 | Reg.34(4) | Fire fighting shaft | VERIFIED_AND_IMPLEMENTED | high-rise status, shaft components | 73 | high-rise trigger behavior | Component-level compliance remains manual unless documented. |
| CH4-FIRE-ALARM-TABLE14 | 4 | Reg.35(1), Table 14 | Fire alarm system | VERIFIED_AND_IMPLEMENTED | building use, storeys, floor area per storey, alarm evidence | 73, 76 | `test_fire_alarm_table14_area_boundary` | Implements clear rows for office/shop/school/clinic/factory/storage. Ambiguous rows remain uncodified. |
| CH4-MANUAL-CALL-POINTS | 4 | Reg.35(1)(d) | Manual alarm call points | VERIFIED_AND_IMPLEMENTED | manual alarm applicability, call point coverage | 74 | feature/manual review behavior | Coverage cannot pass without layout/route evidence. |
| CH4-SPRINKLER-HEIGHT | 4 | Reg.36(1)(b) | Automatic sprinkler system for tall buildings | VERIFIED_AND_IMPLEMENTED | highest habitable storey level, sprinkler evidence | 77 | `test_sprinkler_uses_highest_habitable_level` | Height trigger is implemented; other sprinkler triggers remain outside current schema support. |
| CH4-SPRINKLER-COMPARTMENTATION | 4 | Reg.36(1)(a), Reg.10(1), Table 6 | Sprinklers where compartmentation cannot comply | VERIFIED_AND_IMPLEMENTED | explicit compartmentation compliance/failure, sprinkler evidence, open-sided car park exception evidence | 41, 43, 75 | `test_chapter3_compartmentation_dependency_trigger_boundaries`, `test_chapter3_open_sided_carpark_exception` | Does not infer compartmentation failure from missing drawings. |
| CH4-SPRINKLER-HIGH-HAZARD-18M | 4 | Table 6 note 3.2 | High-hazard sprinkler dependency above 18 m | VERIFIED_AND_IMPLEMENTED | high-hazard occupancy evidence, habitable floor level, sprinkler evidence | 43 | `test_high_hazard_sprinkler_18m_boundary` | Requires explicit high-hazard evidence. |
| CH4-PORTABLE-EXTINGUISHERS | 4 | Reg.37-Reg.39, Tables 15-16 | Portable fire extinguishers | UNRESOLVED_SOURCE | hazard class, fire class, hazard area, travel distance | 81-83 | unresolved/manual behavior | Current architectural-plan schema does not verify hazard class or UDA-specific selection. |
| CH4-EXTERNAL-HYDRANTS | 4 | Reg.40 | External hydrants | NOT_SUPPORTED_BY_CURRENT_INPUT | public hydrant distance, site infrastructure, premises type | 83 | unresolved/manual behavior | Requires site/fire-service information, not ordinary architectural-plan extraction. |

## Manual Verification Still Required

- Complete any project-specific purpose-group classification when the drawing says only "mixed development" or otherwise matches more than one Table 2 group.
- Provide reliable traversable route geometry before treating a selected Table 5 limit as a measured travel-distance result.
- Add fire-service/site drawing extraction before evaluating hydrant and firefighting-access requirements.

## Table 2 Purpose Groups

Source: Table 2, page 17.

| Purpose Group | ICTAD Description | Supported Classification | Source | Implementation Status |
|---|---|---|---|---|
| 1(a) | Flat or maisonette | flat, maisonette, apartment | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 1(b) | Dwelling house containing a habitable storey with a floor more than 4.5 m above ground level | dwelling house, house, subject to height evidence | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 1(c) | Dwelling house not containing a habitable storey with a floor more than 4.5 m above ground level | low dwelling house, single dwelling, terrace house, detached garage/carport where described | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 2(a) | Hospital, nursing home, home for old people or children, school etc used as living accommodation or for treatment/care, place of detention where people sleep | hospital, nursing home, detention, school living accommodation | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 2(b) | Hotel, boarding house, residential college, hall of residence, hostel, other residential purpose not described above | hotel, boarding house, residential college, hall of residence, hostel | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 3 | Offices or premises for administration, clerical work, money handling, communications, recording or performance not open to public | office, administration, clerical, bank/communications where not public retail | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 4 | Shops or premises used for retail trade, hire or repair | shop, shopping centre, retail, hire/repair | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 5 | Place of assembly, entertainment or recreation | assembly, entertainment, recreation, cinema, theatre, public resort | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 6 | Factories, other premises used for manufacturing | factory, manufacturing, industrial/workshop where manufacturing is evident | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 7(a) | Storage of goods/materials other than 7(b), and buildings not within groups 1-6 | storage, warehouse, godown | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |
| 7(b) | Car parks for light vehicles | car park, parking garage, light vehicle parking | Table 2 p17 | VERIFIED_AND_IMPLEMENTED |

Ambiguous or mixed-use descriptions preserve matched groups and return `AMBIGUOUS` instead of selecting one silently.

## Table 5 Travel-Distance Limits

Source: Table 5, page 30. One-way note: for all cases other than Purpose Group I buildings where there is only one escape route, maximum travel distance is 13 m unsprinklered and 19 m sprinklered.

| Table 5 Row | Purpose Group Basis | One-Way Unsprinklered | One-Way Sprinklered | Two-Way Unsprinklered | Two-Way Sprinklered | Implementation Status |
|---|---|---:|---:|---:|---:|---|
| High hazard | Explicit high-hazard evidence | 13 m | 19 m | 20 m | 35 m | VERIFIED_AND_IMPLEMENTED |
| Industrial buildings | Purpose Group 6 / relevant storage-godown use | 13 m | 19 m | 30 m | 45 m | VERIFIED_AND_IMPLEMENTED |
| Business, shops, offices etc. | Purpose Groups 3 and 4 | 13 m | 19 m | 45 m | 60 m | VERIFIED_AND_IMPLEMENTED |
| Places of public resort and car parks | Purpose Groups 5 and 7(b) | 13 m | 19 m | 45 m | 60 m | VERIFIED_AND_IMPLEMENTED |
| Schools and educational buildings | Specific 2(a) school/educational evidence | 13 m | 19 m | 45 m | 60 m | VERIFIED_AND_IMPLEMENTED |
| Hospitals | Specific 2(a) hospital evidence | 13 m | 19 m | 30 m | 45 m | VERIFIED_AND_IMPLEMENTED |
| Hotels and boarding houses | Purpose Group 2(b) | 13 m | 19 m | 30 m | 45 m | VERIFIED_AND_IMPLEMENTED |
| Blocks of flats | Purpose Group 1(a) | Not applied to Purpose Group I one-way note | Not applied to Purpose Group I one-way note | 30 m | 45 m | VERIFIED_AND_IMPLEMENTED |
| Detached, semi-detached and terrace houses | Purpose Groups 1(b), 1(c) | NR | NR | NR | NR | VERIFIED_AND_IMPLEMENTED |

`select_travel_distance_limit(...)` only selects a limit. It does not measure a route. If the selected limit is known but `travel_distance_m` is absent from reliable geometry, the rule result is `MANUAL_REVIEW`.

## Chapter 3 Dependencies

| Clause | Dependency | Used By Rule | Implemented? | Required Evidence | Source |
|---|---|---|---|---|---|
| Reg.10(1), Table 6 | Compartment floor area and cubic extent limits by height/sprinkler condition | CH4-SPRINKLER-COMPARTMENTATION | Partial: explicit pass/fail evidence only | `chapter3_compartmentation_complies`, open-sided car-park exception evidence, sprinkler evidence | pages 41, 43, 75 |
| Reg.10(2) | UDA consent to greater compartment sizes with sprinkler and fire brigade access | CH4-SPRINKLER-COMPARTMENTATION | NOT_SUPPORTED_BY_CURRENT_INPUT | UDA consent and fire strategy/site access documentation | page 42 |
| Table 6 note 3.2 | High hazard occupancy with habitable floor above 18 m requires automatic sprinkler system | CH4-SPRINKLER-HIGH-HAZARD-18M | VERIFIED_AND_IMPLEMENTED | high-hazard occupancy evidence, habitable floor level, sprinkler evidence | page 43 |
