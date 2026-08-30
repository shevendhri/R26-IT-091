from dataclasses import dataclass
from enum import Enum

SOURCE = "ICTAD- FIRE REGULATION (1).pdf"

class ResolutionStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    AMBIGUOUS = "AMBIGUOUS"
    UNKNOWN = "UNKNOWN"
    RESOLVED = "RESOLVED"
    UNRESOLVED = "UNRESOLVED"

@dataclass(frozen=True)
class PurposeGroup:
    code: str
    title: str
    ictad_description: str
    included_uses: tuple[str, ...]
    excluded_uses: tuple[str, ...]
    source: str = "Table 2"
    source_pages: tuple[int, ...] = (17,)

PURPOSE_GROUP_CATALOG: dict[str, PurposeGroup] = {
    "1(a)": PurposeGroup("1(a)","Residential (dwellings)","Flat or maisonette",("flat","maisonette","apartment"),()),
    "1(b)": PurposeGroup("1(b)","Residential (dwellings)","Dwelling house containing a habitable storey with a floor more than 4.5 m above ground level",("dwelling house","house"),("not containing a habitable storey with a floor more than 4.5 m above ground level",)),
    "1(c)": PurposeGroup("1(c)","Residential (dwellings)","Dwelling house not containing a habitable storey with a floor more than 4.5 m above ground level",("low dwelling house","single dwelling","terrace house","detached garage","carport"),()),
    "2(a)": PurposeGroup("2(a)","Residential (Institutional)","Hospital, nursing home, home for old people or children, school etc used as living accommodation or for treatment or care of sick or disabled, place of detention, where people sleep on the premises",("hospital","nursing home","home for old people","children home","school living accommodation","place of detention","detention"),()),
    "2(b)": PurposeGroup("2(b)","Residential (Other)","Hotel, boarding house, residential college, hall of residence, hostel, and any other residential purpose not described above",("hotel","boarding house","residential college","hall of residence","hostel","student hostel"),()),
    "3": PurposeGroup("3","Office","Offices or premises used for administration, clerical work, handling money, communications, recording or performance not open to the public",("office","administration","clerical","bank","communications","recording"),("shop","retail","open to the public")),
    "4": PurposeGroup("4","Shop & Commercial","Shops or premises used for retail trade, hire or repair",("shop","shopping centre","retail trade","retail","hire or repair","commercial shop"),()),
    "5": PurposeGroup("5","Assembly and Recreation","Place of assembly, entertainment or recreation",("assembly","entertainment","recreation","cinema","theatre","public resort","auditorium"),()),
    "6": PurposeGroup("6","Industrial","Factories, other premises used for manufacturing",("factory","manufacturing","industrial","workshop"),()),
    "7(a)": PurposeGroup("7(a)","Storage and other non residential","Place for the storage of goods or materials other than 7(b) and any building not within groups 1-6",("storage","warehouse","godown","store of goods"),("car park","parking")),
    "7(b)": PurposeGroup("7(b)","Storage and other non residential","Car parks for light vehicles",("car park","parking garage","light vehicle parking"),()),
}

PURPOSE_GROUP_ALIASES = {
    term: code
    for code, group in PURPOSE_GROUP_CATALOG.items()
    for term in group.included_uses
}

@dataclass(frozen=True)
class TravelDistanceLimit:
    key: str
    occupancy: str
    purpose_groups: tuple[str, ...]
    two_way_unsprinklered_m: float | None
    two_way_sprinklered_m: float | None
    source: str = "Table 5"
    source_pages: tuple[int, ...] = (30,)

TRAVEL_DISTANCE_LIMITS: dict[str, TravelDistanceLimit] = {
    "high_hazard": TravelDistanceLimit("high_hazard","High hazard",(),20,35),
    "industrial": TravelDistanceLimit("industrial","Industrial buildings (factories, workshops, godowns)",("6","7(a)"),30,45),
    "business": TravelDistanceLimit("business","Business (shops, offices etc)",("3","4"),45,60),
    "public_resort_carpark": TravelDistanceLimit("public_resort_carpark","Places of public resort and car parks",("5","7(b)"),45,60),
    "school": TravelDistanceLimit("school","Schools & educational buildings",("2(a)",),45,60),
    "hospital": TravelDistanceLimit("hospital","Hospitals",("2(a)",),30,45),
    "hotel_boarding": TravelDistanceLimit("hotel_boarding","Hotels, boarding houses",("2(b)",),30,45),
    "flats": TravelDistanceLimit("flats","Blocks of flats",("1(a)",),30,45),
    "detached_residential": TravelDistanceLimit("detached_residential","Detached, semi-detached and terrace houses",("1(b)","1(c)"),None,None),
}

ONE_WAY_TRAVEL_DISTANCE_NOTE = {
    "one_way_unsprinklered_m": 13,
    "one_way_sprinklered_m": 19,
    "source": "Table 5 note",
    "source_pages": [30],
    "note": "For all cases other than Purpose Group I buildings where there is only one escape route.",
}

CHAPTER3_DEPENDENCIES = {
    "compartmentation_limits": {
        "regulation": "Reg.10(1), Table 6",
        "source_pages": [41,43],
        "used_by": ["CH4-SPRINKLER-COMPARTMENTATION"],
        "required_evidence": ["purpose group", "building height", "compartment floor area", "compartment cubic extent", "sprinkler status"],
        "status": "VERIFIED_DEPENDENCY_MANUAL_INPUT_REQUIRED",
        "notes": "Reg.36(1)(a) requires sprinklers whenever Chapter 3 compartmentation requirements cannot be complied with. FireGuard does not infer compartment failure from incomplete architectural evidence.",
    },
    "compartmentation_authority_consent": {
        "regulation": "Reg.10(2)",
        "source_pages": [42],
        "used_by": ["CH4-SPRINKLER-COMPARTMENTATION"],
        "required_evidence": ["UDA consent", "sprinkler proposal", "fire brigade accessibility", "other fire safety measures"],
        "status": "NOT_SUPPORTED_BY_CURRENT_INPUT",
        "notes": "Authority consent and supporting fire strategy documents are outside ordinary architectural-plan extraction.",
    },
    "high_hazard_sprinkler": {
        "regulation": "Table 6 note 3.2",
        "source_pages": [43],
        "used_by": ["CH4-SPRINKLER-HIGH-HAZARD-18M"],
        "required_evidence": ["high hazard occupancy", "habitable floor level above 18 m", "sprinkler evidence"],
        "status": "VERIFIED_AND_IMPLEMENTED",
        "notes": "If habitable floor exceeds 18 m in high hazard occupancy, automatic sprinkler system is required.",
    },
}
