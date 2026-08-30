import json

from green_assessment import models
from green_assessment.database import SessionLocal

FRAMEWORK_CODE = "UDA_BLUE_GREEN"
FRAMEWORK_VERSION = "2025"
FRAMEWORK_DESCRIPTION = "UDA Blue Green Sri Lanka - Green Building Guidelines for Sri Lanka."

UDA_CATEGORIES = [
    {"category_code": "EE", "category_name": "Energy Efficiency"},
    {"category_code": "SM", "category_name": "Sustainable Land Management and Planning"},
    {"category_code": "MR", "category_name": "Building Materials & Resources"},
    {"category_code": "EQ", "category_name": "Quality of Internal Environment of the Building"},
    {"category_code": "WE", "category_name": "Water Efficiency"},
    {"category_code": "IN", "category_name": "Green Innovation"},
    {"category_code": "SC", "category_name": "Socio-Cultural Compatibility"},
]

UDA_CRITERIA_DATA = [{'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE1',
  'criterion_name': 'Zoning of Lighting Sources / Equipment',
  'objective': 'Energy Management in the subjected using areas of lights by providing a flexible '
               'light \n'
               'control. The cost of the electricity is expected to be reduced by flexible control '
               'mechanism \n'
               'only in the utilized areas in a building.',
  'methodology': '* Light fittings of every separated and closed space shall be controlled by '
                 'individual \n'
                 'switches. The percentage of individual switches controlled zones of the building '
                 'shall \n'
                 'be 90% of the total building area. Individual switch control area shall not '
                 'exceed than \n'
                 '100m2 \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '* Installation of self-sensitive control systems for electrical lighting control '
                 'in the time \n'
                 'of building receiving the sunlight and spaces are not utilized. \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 'Switches shall be clearly numbered and, building users shall be able to reach '
                 'the switches \n'
                 'easily. (Above marking scheme will be subjected to change according to the final '
                 'assessment \n'
                 'levels released Sustainable Energy Authority).',
  'maximum_marks': 2.0,
  'source_page': 2,
  'scoring_status': 'partially_defined',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Light fittings of every separated and closed space shall be '
                               'controlled by individual \n'
                               'switches. The percentage of individual switches controlled zones '
                               'of the building shall \n'
                               'be 90% of the total building area. Individual switch control area '
                               'shall not exceed than \n'
                               '100m2',
             'marks': 1.0},
            {'condition_text': 'Installation of self-sensitive control systems for electrical '
                               'lighting control in the time \n'
                               'of building receiving the sunlight and spaces are not utilized. '
                               'Switches shall be clearly numbered and, building users shall be '
                               'able to reach the switches \n'
                               'easily. (Above marking scheme will be subjected to change '
                               'according to the final assessment \n'
                               'levels released Sustainable Energy Authority).',
             'marks': 1.0}],
  'da_documents': ['Plans of lighting zones controlled by Individual switches and area covered',
                   'A detailed electrical layout. Location map of the Sensors and switches area '
                   'covered by the automatic control',
                   'A report on Percentage achieving full spatial requirements of areas where '
                   'single switch are fixed EE - Energy Efficiency EE1 - Zoning of Lighting '
                   'Sources / Equipment 02 Marks'],
  'cva_documents': ['construction (CVA) Applicant Green Unit',
                    'As-built drawings of all single switch lighting areas and zones',
                    'As-built drawing of location of the switches and sensors including the '
                    'controlled areas',
                    'A report confirmed that the total plot coverage of the building fulfill the '
                    'required percentage',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE2',
  'criterion_name': 'Electricity Sub-Metering',
  'objective': 'To encourage sub-metering to monitor the energy consumption of the main building, '
               'all other \n'
               'areas, and energy intense equipment',
  'methodology': '* Electricity Submeters for parking areas, air conditioning elevators, public '
                 'places and \n'
                 'areas where energy consumption of â‰¥100 KVA. \n'
                 '- \n'
                 'For renter buildings, separate sub-meters shall be installed for each renter \n'
                 'space. Each renter space shall be separated as in one floor or space that can '
                 'be \n'
                 'easily separated for electrical use \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '* Buildings with Energy Management System, every sub-meters shall be connected '
                 'to \n'
                 'the EMS system. \n'
                 '01 Mark \n'
                 ' \n'
                 ' (Above marking scheme will be subjected to change according to the final '
                 'assessment levels \n'
                 'released Sustainable Energy Authority)',
  'maximum_marks': 2.0,
  'source_page': 4,
  'scoring_status': 'partially_defined',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Electricity Submeters for parking areas, air conditioning '
                               'elevators, public places and \n'
                               'areas where energy consumption of â‰¥100 KVA. \n'
                               '- \n'
                               'For renter buildings, separate sub-meters shall be installed for '
                               'each renter \n'
                               'space. Each renter space shall be separated as in one floor or '
                               'space that can be \n'
                               'easily separated for electrical use',
             'marks': 1.0},
            {'condition_text': 'Buildings with Energy Management System, every sub-meters shall be '
                               'connected to \n'
                               'the EMS system. (Above marking scheme will be subjected to change '
                               'according to the final assessment levels \n'
                               'released Sustainable Energy Authority)',
             'marks': 1.0}],
  'da_documents': ['Specifications for installation of electricity sub meters',
                   'Systematic plan and notes on locations of proposed sub-meters and meter '
                   'service stations'],
  'cva_documents': ['construction (CVA)',
                    'As-built drawings of locations of sub-meters and areas covering by the '
                    'sub-meters 2 Additions and alterations were done to submitted information for '
                    'evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE3',
  'criterion_name': 'Renewable Energy',
  'objective': 'To encourage the Reduction of the environmental pollution caused by Carbon dioxide '
               '(CO2) \n'
               'emission from fuel consumption by using renewable energy. This will encourage the '
               'use of \n'
               'green energy and reduce the demand for new fuel power plants.',
  'methodology': 'Total energy requirement of the building shall be used the following percentages '
                 'of \n'
                 'renewable energy (This value will be considered for scoring). \n'
                 ' \n'
                 '* Total Solar panels cover shall be 20% of the building plot coverage or 40% of '
                 'the \n'
                 'Electricity contract demand shall be met by solar panels \n'
                 ' \n'
                 '02 Marks \n'
                 '* Total Solar panels cover shall be 40% of the building plot coverage or 60% of '
                 'the \n'
                 'Electricity contract demand shall be met by solar panels \n'
                 '04 Marks \n'
                 '* Total Solar panels cover shall be 60% of the building plot coverage or 80% of '
                 'the \n'
                 'Electricity contract demand shall be met by solar panels \n'
                 '06 Marks \n'
                 '* Total Solar panels cover shall be 80% of the building plot coverage or 100% of '
                 'the \n'
                 'Electricity contract demand shall be met by solar panels \n'
                 ' \n'
                 '08 Marks \n'
                 ' \n'
                 '(Above marking scheme will be subjected to change according to the final '
                 'assessment levels \n'
                 'released Sustainable Energy Authority)',
  'maximum_marks': 8.0,
  'source_page': 5,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Total Solar panels cover shall be 20% of the building plot '
                               'coverage or 40% of the \n'
                               'Electricity contract demand shall be met by solar panels',
             'marks': 2.0},
            {'condition_text': 'Total Solar panels cover shall be 40% of the building plot '
                               'coverage or 60% of the \n'
                               'Electricity contract demand shall be met by solar panels',
             'marks': 4.0},
            {'condition_text': 'Total Solar panels cover shall be 60% of the building plot '
                               'coverage or 80% of the \n'
                               'Electricity contract demand shall be met by solar panels',
             'marks': 6.0},
            {'condition_text': 'Total Solar panels cover shall be 80% of the building plot '
                               'coverage or 100% of the \n'
                               'Electricity contract demand shall be met by solar panels (Above '
                               'marking scheme will be subjected to change according to the final '
                               'assessment levels \n'
                               'released Sustainable Energy Authority)',
             'marks': 8.0}],
  'da_documents': ['Plan and side Elevations of the places allocated for renewable energy '
                   'equipment',
                   'Technical report on technology installation methodology and expected energy '
                   'output (kWp) generated by renewable energy shall be defined',
                   'A report on expected renewable energy generation as a percentage overall '
                   'energy consumption of the building'],
  'cva_documents': ['As built drawings (plans and Elevations) of locations of renewable energy '
                    'equipment',
                    "Manufacturer's technical specification for Renewable Energy Equipment",
                    'Report on amount of energy generated by renewable energy generation systems '
                    '(kWp)',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE4',
  'criterion_name': 'High Performance Energy Efficiency',
  'objective': 'Reduction of energy consumption of a building and thereby minimizing CO2 '
               'emissions.',
  'methodology': 'The points will be awarded for the buildings which exceed the compulsory level '
                 'of energy \n'
                 'efficiency to reduce energy consumption. 200 working days with 08-hour work per '
                 'a day will \n'
                 'be considered per year \n'
                 ' \n'
                 'Energy consumption of a year One Square meter of the building \n'
                 'between (BEI) 150kWh / m2 / Year - 130kWh / m2 / Year \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 'Energy consumption of a year one Square meter of the building \n'
                 '(BEI) â‰¤ 130kWh/m2 /Year - - 110kWh/m2 /Year \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '03 Marks \n'
                 ' \n'
                 'Energy consumption of a year one Square meter of the building \n'
                 '(BEI) â‰¤ 110kWh/m2 /Year - - 90kWh/m2 /Year \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '05 Marks \n'
                 ' \n'
                 ' \n'
                 '(Above marking scheme will be subject to change according to the final '
                 'assessment levels \n'
                 'released by Sustainable Energy Authority)',
  'maximum_marks': 5.0,
  'source_page': 7,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'The points will be awarded for the buildings which exceed the '
                               'compulsory level of energy \n'
                               'efficiency to reduce energy consumption. 200 working days with '
                               '08-hour work per a day will \n'
                               'be considered per year \n'
                               ' \n'
                               'Energy consumption of a year One Square meter of the building \n'
                               'between (BEI) 150kWh / m2 / Year - 130kWh / m2 / Year Energy '
                               'consumption of a year one Square meter of the building \n'
                               '(BEI) â‰¤ 130kWh/m2 /Year - - 110kWh/m2 /Year Energy consumption of '
                               'a year one Square meter of the building \n'
                               '(BEI) â‰¤ 110kWh/m2 /Year - - 90kWh/m2 /Year (Above marking scheme '
                               'will be subject to change according to the final assessment '
                               'levels \n'
                               'released by Sustainable Energy Authority)',
             'marks': 1.0}],
  'da_documents': ['Copies of each document to reach the level of mandatory energy efficiency (for '
                   'review)',
                   'Calculation sheet for proposed energy consumption for Square meter of the '
                   'building per year (BEI)'],
  'cva_documents': ['Documents to confirm the level achieved by building completed',
                    'Copies of data sheet on BEI from Energy Management System',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE5',
  'criterion_name': 'Efficiency of Electric Illumination',
  'objective': 'To maximize the efficient use of energy in internal and external illumination.',
  'methodology': 'Lighting power density of â‰¥ 80% from light fittings used for internal space '
                 'illumination \n'
                 '(Lighting Power Density) shall not exceed 10W / m2. \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 'When external light fittings exceeding the power of 70W are used, the minimum '
                 'efficiency of \n'
                 '80 lm / W should be maintained. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '(Above marking scheme will be subjected to change according to the final '
                 'assessment levels \n'
                 'released by Sustainable Energy Authority)',
  'maximum_marks': 2.0,
  'source_page': 8,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Lighting power density of â‰¥ 80% from light fittings used for '
                               'internal space illumination \n'
                               '(Lighting Power Density) shall not exceed 10W / m2. When external '
                               'light fittings exceeding the power of 70W are used, the minimum '
                               'efficiency of \n'
                               '80 lm / W should be maintained. (Above marking scheme will be '
                               'subjected to change according to the final assessment levels \n'
                               'released by Sustainable Energy Authority)',
             'marks': 1.0}],
  'da_documents': ['Detailed plans, specifications and methodology for the installation of indoor '
                   'and outdoor lighting'],
  'cva_documents': ['As built drawing and detailed report on indoor and outdoor lighting '
                    'installation',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE6',
  'criterion_name': 'Power Factor Correction',
  'objective': 'Avoid incresement of maximum Energy Demand.',
  'methodology': 'Controller devise with power factor correction accuracy within .98-1 shall be '
                 'installed for \n'
                 'three phase power supply over 60A \n'
                 ' \n'
                 '(Above marking scheme will be subjected to change according to the final '
                 'assessment levels \n'
                 'released Sustainable Energy Authority)',
  'maximum_marks': 2.0,
  'source_page': 9,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Controller devise with power factor correction accuracy within '
                               '.98-1 shall be installed for \n'
                               'three phase power supply over 60A \n'
                               ' \n'
                               '(Above marking scheme will be subjected to change according to the '
                               'final assessment levels \n'
                               'released Sustainable Energy Authority)',
             'marks': None}],
  'da_documents': ['Specifications of power factor correction devices proposed to be installed'],
  'cva_documents': ['Specifications of power factor correction device installed',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE7',
  'criterion_name': 'Improvement and Operation of Energy Efficiency',
  'objective': 'Establishment methods of energy systems to achieve its fullest ability to minimize '
               'the errors \n'
               'caused in installation and operation procedures',
  'methodology': '* Appointment of an independent expert consultant on energy systems in the '
                 'initial \n'
                 'stage of the project to take advice on system installation and operations \n'
                 ' \n'
                 '* Review of the energy system in the planning stage of the building at least one '
                 'time. \n'
                 'Monitoring the system installation procedure up to the preparation of tender \n'
                 'documents. \n'
                 '* Providing a mechanism for the implementation of the planned buildings energy \n'
                 'systems. \n'
                 ' \n'
                 '* Ensuring the compatibility of contractorâ€™s energy system installation '
                 'methodology \n'
                 'with the procedures of proposed energy systems. \n'
                 ' \n'
                 '* Development of procedures through a system manual in order to achieve '
                 'efficiency \n'
                 'systems and enable future operatorsâ€™ to maintain energy system with its '
                 'maximum \n'
                 'performance and efficiency. \n'
                 ' \n'
                 ' \n'
                 '(Above marking scheme will be subjected to change according to the final '
                 'assessment levels \n'
                 'released by Sustainable Energy Authority)',
  'maximum_marks': 4.0,
  'source_page': 10,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Appointment of an independent expert consultant on energy systems '
                               'in the initial \n'
                               'stage of the project to take advice on system installation and '
                               'operations',
             'marks': None},
            {'condition_text': 'Review of the energy system in the planning stage of the building '
                               'at least one time. \n'
                               'Monitoring the system installation procedure up to the preparation '
                               'of tender \n'
                               'documents.',
             'marks': None},
            {'condition_text': 'Providing a mechanism for the implementation of the planned '
                               'buildings energy \n'
                               'systems.',
             'marks': None},
            {'condition_text': 'Ensuring the compatibility of contractorâ€™s energy system '
                               'installation methodology \n'
                               'with the procedures of proposed energy systems.',
             'marks': None},
            {'condition_text': 'Development of procedures through a system manual in order to '
                               'achieve efficiency \n'
                               'systems and enable future operatorsâ€™ to maintain energy system '
                               'with its maximum \n'
                               'performance and efficiency. \n'
                               ' \n'
                               ' \n'
                               '(Above marking scheme will be subjected to change according to the '
                               'final assessment levels \n'
                               'released by Sustainable Energy Authority)',
             'marks': None}],
  'da_documents': ['Confirmation certificate from a qualified person in energy systems, assuring '
                   'the consultancy was obtained during the initial planning stage',
                   'Submitting the report and related documents for the proposed improvement of '
                   'the energy system and its performance EE7 - Improvement and Operation of '
                   'Energy Efficiency 04 Marks'],
  'cva_documents': ['The final report with recommendations on open building Energy Systems task',
                    'A copy of Systems manual',
                    'written evidence of management staff training in management structures',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EE',
  'category_name': 'Energy Efficiency',
  'criterion_code': 'EE8',
  'criterion_name': 'Sustainable Maintenance',
  'objective': 'Increasing of energy efficiency by proper maintenance of building energy systems.',
  'methodology': '* Minimum of 50% of the Building maintenance crew shall be mobilized in the site '
                 '03 \n'
                 'months prior to the completion of construction they shall participate in testing '
                 'the \n'
                 'building energy consuming equipment/devices. \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '* Allocation of a separate office building for maintenance work and necessary \n'
                 'maintenance equipment shall be provided. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 ' \n'
                 '(Above marking scheme will be subject to change according to the final '
                 'assessment levels \n'
                 'released Sustainable Energy Authority) \n'
                 ' \n'
                 ' Plans/Documents required for evaluation (DA) \n'
                 ' \n'
                 'Applicant \n'
                 'Green Unit \n'
                 '01. Submission of the plan to identify room for \n'
                 'maintenance \n'
                 ' \n'
                 ' \n'
                 '02. Mobilizing a minimum of 50% maintenance crew \n'
                 'before the practical completion of the building and \n'
                 'identifying team members as necessary \n'
                 ' \n'
                 ' \n'
                 '03. Commitment to documenting estimated maintenance \n'
                 'cost for minimum 3 years including unnecessary \n'
                 'maintenance costs that can be prevented \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Documents/presentations required for accuracy evaluation in completion of \n'
                 'building construction (CVA) \n'
                 ' \n'
                 'Applicant \n'
                 'Green Unit \n'
                 '1. Mobilizing 50% of the maintenance crew 1 to 3 months \n'
                 'before practical completion of the site and mobilizing Full \n'
                 'maintenance crew for energy and system testing following \n'
                 'practical completion of the building \n'
                 ' \n'
                 ' \n'
                 '2. Maintaining a list of tools and equipment, and a list \n'
                 'and details of stocks of goods \n'
                 ' \n'
                 ' \n'
                 '3. Additions and alterations were done to submitted \n'
                 'information for evaluation',
  'maximum_marks': 2.0,
  'source_page': 12,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Minimum of 50% of the Building maintenance crew shall be mobilized '
                               'in the site 03 \n'
                               'months prior to the completion of construction they shall '
                               'participate in testing the \n'
                               'building energy consuming equipment/devices.',
             'marks': 1.0},
            {'condition_text': 'Allocation of a separate office building for maintenance work and '
                               'necessary \n'
                               'maintenance equipment shall be provided. (Above marking scheme '
                               'will be subject to change according to the final assessment '
                               'levels \n'
                               'released Sustainable Energy Authority) \n'
                               ' \n'
                               ' Plans/Documents required for evaluation (DA) \n'
                               ' \n'
                               'Applicant \n'
                               'Green Unit \n'
                               '01. Submission of the plan to identify room for \n'
                               'maintenance \n'
                               ' \n'
                               ' \n'
                               '02. Mobilizing a minimum of 50% maintenance crew \n'
                               'before the practical completion of the building and \n'
                               'identifying team members as necessary \n'
                               ' \n'
                               ' \n'
                               '03. Commitment to documenting estimated maintenance \n'
                               'cost for minimum 3 years including unnecessary \n'
                               'maintenance costs that can be prevented \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Documents/presentations required for accuracy evaluation in '
                               'completion of \n'
                               'building construction (CVA) \n'
                               ' \n'
                               'Applicant \n'
                               'Green Unit \n'
                               '1. Mobilizing 50% of the maintenance crew 1 to 3 months \n'
                               'before practical completion of the site and mobilizing Full \n'
                               'maintenance crew for energy and system testing following \n'
                               'practical completion of the building \n'
                               ' \n'
                               ' \n'
                               '2. Maintaining a list of tools and equipment, and a list \n'
                               'and details of stocks of goods \n'
                               ' \n'
                               ' \n'
                               '3. Additions and alterations were done to submitted \n'
                               'information for evaluation',
             'marks': 1.0}],
  'da_documents': [],
  'cva_documents': ['Mobilizing 50% of the maintenance crew 1 to 3 months before practical '
                    'completion of the site and mobilizing Full maintenance crew for energy and '
                    'system testing following practical completion of the building',
                    'Maintaining a list of tools and equipment, and a list and details of stocks '
                    'of goods',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM1',
  'criterion_name': 'â€“ Site Selection',
  'objective': 'Minimizing environmental impact of construction of a building in unsuitable '
               'sites \n'
               ' \n'
               'Selection of a land with less valuable environmental/ecological system. If it is '
               'an \n'
               'environmentally valuable site to minimize the environmental impact by reducing '
               'the \n'
               'footprint.',
  'methodology': 'To avoid construction of new buildings, filling, hard landscape, and '
                 'construction of roads or \n'
                 'parking at sites with following factors \n'
                 ' \n'
                 '* If the Construction site is providing and important as environmental '
                 'services, \n'
                 'economic services such as agricultural land or Forest under Department Forest \n'
                 ' \n'
                 '- Within the declared wildlife areas and buffer zones \n'
                 '- In a wetland area 30 meters away from a wetland if it is a declared wetland '
                 'with respect to \n'
                 'the terms and conditions of the declaration. \n'
                 '-Special places with threatened species of flora and fauna. (Reference should be '
                 'made to the \n'
                 'final edition of the Red Data list of threatening species or another acceptable '
                 'document to \n'
                 'obtained data). \n'
                 '- Characteristic species or a species spread over a very small area and places '
                 'with endemic \n'
                 'species \n'
                 '- Very rare and rare ecosystems \n'
                 '02 Marks \n'
                 '* \n'
                 'Use of lands not within a at natural disaster risk areas/zones. If constructing '
                 'in a risk \n'
                 'area clearance shall be obtained by the relevant agencies for appropriate '
                 'construction \n'
                 'and installation \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' SM1 â€“ Site Selection \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '04 Marks \n'
                 'SM - Sustainable Land Management and Planning',
  'maximum_marks': 4.0,
  'source_page': 13,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'To avoid construction of new buildings, filling, hard landscape, '
                               'and construction of roads or \n'
                               'parking at sites with following factors',
             'marks': None},
            {'condition_text': 'If the Construction site is providing and important as '
                               'environmental services, \n'
                               'economic services such as agricultural land or Forest under '
                               'Department Forest \n'
                               ' \n'
                               '- Within the declared wildlife areas and buffer zones \n'
                               '- In a wetland area 30 meters away from a wetland if it is a '
                               'declared wetland with respect to \n'
                               'the terms and conditions of the declaration. \n'
                               '-Special places with threatened species of flora and fauna. '
                               '(Reference should be made to the \n'
                               'final edition of the Red Data list of threatening species or '
                               'another acceptable document to \n'
                               'obtained data). \n'
                               '- Characteristic species or a species spread over a very small '
                               'area and places with endemic \n'
                               'species \n'
                               '- Very rare and rare ecosystems',
             'marks': 2.0},
            {'condition_text': 'Use of lands not within a at natural disaster risk areas/zones. If '
                               'constructing in a risk \n'
                               'area clearance shall be obtained by the relevant agencies for '
                               'appropriate construction \n'
                               'and installation SM1 â€“ Site Selection SM - Sustainable Land '
                               'Management and Planning',
             'marks': 2.0}],
  'da_documents': ['Location plan of the site',
                   'Approved survey plan',
                   'Footprint of the proposed building, building location, distances to the '
                   'border, natural lakes, rivers, water streams, and the sea closed proximity to '
                   'the site, etc. Shall be clearly marked on the site plan.'],
  'cva_documents': ['As-built drawings with a footprint of the constructed building, distances to '
                    'the borders, natural lakes, rivers, water streams, and sea proximity to the '
                    'site, etc. Shall be clearly marked on the site plan.',
                    'Design changes or additions to the design after reviewing the original '
                    'documents',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM2',
  'criterion_name': 'â€“Abandoned (Brown field) Site Redevelopment',
  'objective': 'Use of abundant buildings and land for construction in order to reduce the usage '
               'of clear land \n'
               'for construction. Examples: Old factory complexes, Garbage dumping sites, and '
               'Mining sites',
  'methodology': 'To re-development of the land that had been damaged due to the prior '
                 'construction. \n'
                 'Remedies can be applied to prepare the ground. This can be done by testing soil '
                 'samples \n'
                 'taken from the site. \n'
                 ' \n'
                 'Offered points \n'
                 ' \n'
                 '* 10% -50% of the total land area has been re- developed \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 '* 51% -69% of the total land area has been re â€“ developed \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks \n'
                 '* 70% or above of the total land area has been re â€“ developed \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '03 Marks',
  'maximum_marks': 3.0,
  'source_page': 15,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'To re-development of the land that had been damaged due to the '
                               'prior construction. \n'
                               'Remedies can be applied to prepare the ground. This can be done by '
                               'testing soil samples \n'
                               'taken from the site. \n'
                               ' \n'
                               'Offered points',
             'marks': None},
            {'condition_text': '10% -50% of the total land area has been re- developed',
             'marks': 1.0},
            {'condition_text': '51% -69% of the total land area has been re â€“ developed',
             'marks': 2.0},
            {'condition_text': '70% or above of the total land area has been re â€“ developed',
             'marks': 3.0}],
  'da_documents': ['Short report on the prior use of the land and certified test report done '
                   'measure the level of soil pollution',
                   'Removal of contaminated soil and other proposed measures, including '
                   'environmental impact assessment report.'],
  'cva_documents': ['A report on the decontamination process',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM3',
  'criterion_name': 'â€“Development Density and Community Coordination',
  'objective': 'Protecting green lands and lands with threatened environmental systems by giving '
               'priority for \n'
               'construction of buildings at areas with developed/ improved existing '
               'infrastructure. Reducing \n'
               'the private vehicle usage by increasing the development density and '
               'reconstruction.',
  'methodology': '* Development Density \n'
                 ' \n'
                 'Upgrading/ refurbishing of an existing building in a develop land or construct a '
                 'new building. \n'
                 'Selecting a site which has developed at least 40% of the land extend. \n'
                 ' \n'
                 ' \n'
                 'Or \n'
                 ' \n'
                 ' \n'
                 '* Community connectivity \n'
                 ' \n'
                 'When upgrading/ refurbishing of an existing building in a develop land or '
                 'constructing a new \n'
                 'building from either relative density per acre Unit 10 collective zone or the '
                 'building located \n'
                 '01 km from a residential zone and if at least 10 community facilities are '
                 'available 1km from \n'
                 'the building. Pedestrian/public accesses shall be provided. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Examples for above mentioned public amenities \n'
                 ' \n'
                 'Banks \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Schools \n'
                 'Parks \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Workshops \n'
                 'Offices \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Stores \n'
                 'Pharmacies \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Day Care \n'
                 'Restaurants \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Post Offices \n'
                 'Police Stations \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Fire stations \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Supermarkets \n'
                 'Hardware \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Laundries \n'
                 'Libraries \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Medical centers \n'
                 'Information centers \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark',
  'maximum_marks': 1.0,
  'source_page': 16,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Development Density \n'
                               ' \n'
                               'Upgrading/ refurbishing of an existing building in a develop land '
                               'or construct a new building. \n'
                               'Selecting a site which has developed at least 40% of the land '
                               'extend. \n'
                               ' \n'
                               ' \n'
                               'Or',
             'marks': None},
            {'condition_text': 'Community connectivity \n'
                               ' \n'
                               'When upgrading/ refurbishing of an existing building in a develop '
                               'land or constructing a new \n'
                               'building from either relative density per acre Unit 10 collective '
                               'zone or the building located \n'
                               '01 km from a residential zone and if at least 10 community '
                               'facilities are available 1km from \n'
                               'the building. Pedestrian/public accesses shall be provided. \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Examples for above mentioned public amenities \n'
                               ' \n'
                               'Banks \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Schools \n'
                               'Parks \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Workshops \n'
                               'Offices \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Stores \n'
                               'Pharmacies \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Day Care \n'
                               'Restaurants \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Post Offices \n'
                               'Police Stations \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Fire stations \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Supermarkets \n'
                               'Hardware \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Laundries \n'
                               'Libraries \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Medical centers \n'
                               'Information centers',
             'marks': 1.0}],
  'da_documents': [],
  'cva_documents': ['Final calculation of the density',
                    'Construction layout shall be provided with location of public amenities, '
                    'paved pathways, public accesses, connectors and underground services and '
                    'connections',
                    'The color index shall be devised for a different type of amenities.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM4',
  'criterion_name': 'â€“ Preparation of Environmental Management and Environmental',
  'objective': 'Safeguarding the natural environment, minimizing the impact on natural environment '
               'in the \n'
               'construction implementation by following an effective management and safeguard '
               'measures',
  'methodology': 'Preparation of Environmental Management Plan and Environmental safeguard plan '
                 'with \n'
                 'guidelines to follow during the building construction and usage (marks will be '
                 'doubled if the \n'
                 'contractor is ISO 14001 certified) \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark',
  'maximum_marks': 1.0,
  'source_page': 18,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Preparation of Environmental Management Plan and Environmental '
                               'safeguard plan with \n'
                               'guidelines to follow during the building construction and usage '
                               '(marks will be doubled if the \n'
                               'contractor is ISO 14001 certified)',
             'marks': 1.0}],
  'da_documents': ['Detail report on Environmental Management and Safeguard Plan prepared in '
                   'relation to the project'],
  'cva_documents': ['Detailed report on implementation of environmental management and protection '
                    'prepared for project evaluation',
                    'Additions and alterations done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM5',
  'criterion_name': 'â€“ Laying and Improvement of Green Ground Cover',
  'objective': 'Assigning of more outdoor open spaces with the green cover in development '
               'initiative and to \n'
               'encourage to use endemic and indigenous trees and plants in the landscape.',
  'methodology': 'Open areas shall be kept as declared by Urban Development Authority or Local '
                 'Authority. \n'
                 '70% of these open areas shall be of green covers which 40% of it consisting of '
                 'endemic and \n'
                 'indigenous plants. When there is no sufficient space to have a green cover on '
                 'the ground. \n'
                 'Vertical and roof gardens shall be encouraged. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 marks',
  'maximum_marks': 2.0,
  'source_page': 19,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Open areas shall be kept as declared by Urban Development '
                               'Authority or Local Authority. \n'
                               '70% of these open areas shall be of green covers which 40% of it '
                               'consisting of endemic and \n'
                               'indigenous plants. When there is no sufficient space to have a '
                               'green cover on the ground. \n'
                               'Vertical and roof gardens shall be encouraged.',
             'marks': 2.0}],
  'da_documents': ['Landscape layout with the footprint of the proposed building. Lengths from '
                   'building to the boundaries of the proposed site. Soft and hard landscape '
                   'design.',
                   'Endemic and indigenous vegetation cover ratio should be reflected in the '
                   'landscape plan',
                   'List of names of proposed plants, planting schedule and planting pallet '
                   'elaborating the features of the pants, heights, form etc.'],
  'cva_documents': ['As Built Drawing of the completed Landscape layout with the footprint of the '
                    'proposed building. The lengths from building to the boundaries of the site. '
                    'Soft and hard landscape.',
                    'Endemic and indigenous vegetation cover ratio should be reflected as-built '
                    'plan of the landscape',
                    'List of names of proposed plants, planting schedule and planting pallet for '
                    'Landscape plan.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM6',
  'criterion_name': 'â€“ Mitigation of Construction Pollution',
  'objective': 'Controlling of Soil erosion, reduction of air pollution caused during construction '
               'work by \n'
               'dust and minimizing sediments along canals. \n'
               ' \n'
               'Consultants and owners shall follow a proper sedimentation and erosion management '
               'plan at \n'
               'the early design stage and this aspect shall be taken into account in procurement',
  'methodology': 'Following requirements shall be fulfilled by complying engineering actions '
                 'specified by \n'
                 'CIDA for mitigation of sedimentation and erosion \n'
                 ' \n'
                 '* Reducing soil erosion caused by the rainwater runoff and to reduce silt \n'
                 'deposition in the canals and to reducing the spread of dust in the air and '
                 'noise \n'
                 'pollution shall be done during construction of building \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark',
  'maximum_marks': 1.0,
  'source_page': 20,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Following requirements shall be fulfilled by complying engineering '
                               'actions specified by \n'
                               'CIDA for mitigation of sedimentation and erosion',
             'marks': None},
            {'condition_text': 'Reducing soil erosion caused by the rainwater runoff and to reduce '
                               'silt \n'
                               'deposition in the canals and to reducing the spread of dust in the '
                               'air and noise \n'
                               'pollution shall be done during construction of building',
             'marks': 1.0}],
  'da_documents': ['Plan/ proposal for control sedimentation and erosion'],
  'cva_documents': ['Report on sedimentation and erosion control certified by a qualified person',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM7',
  'criterion_name': 'â€“ Quality Assurance in the Building Construction',
  'objective': 'Utilization of quality assessment system familiarized by CIDA for building '
               'construction. In \n'
               'order to achieve the quality of the construction',
  'methodology': '* The quality of the construction work shall be achieved for each and every \n'
                 'building feature as per the specifications published by CIDA. \n'
                 ' \n'
                 '* All consultants, contractors, building owner, and sub-contractors shall be \n'
                 'aware of quality assessment and construction quality of buildings. \n'
                 ' \n'
                 '* Construction shall be monitored by a qualified person and contractor and \n'
                 'subcontractors shall adopt the CIDA publication.',
  'maximum_marks': 1.0,
  'source_page': 21,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'The quality of the construction work shall be achieved for each '
                               'and every \n'
                               'building feature as per the specifications published by CIDA.',
             'marks': None},
            {'condition_text': 'All consultants, contractors, building owner, and sub-contractors '
                               'shall be \n'
                               'aware of quality assessment and construction quality of buildings.',
             'marks': None},
            {'condition_text': 'Construction shall be monitored by a qualified person and '
                               'contractor and \n'
                               'subcontractors shall adopt the CIDA publication.',
             'marks': None}],
  'da_documents': ['Report on proposed plan to comply with the relevant CIDA publication'],
  'cva_documents': ['Certification by Project Engineer and Project Architect to state that the '
                    'quality was achieved accordance to CIDA specifications',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM8',
  'criterion_name': 'â€“ Workers Facilities',
  'objective': 'To reduce pollution caused by waste generated by the site workers and other '
               'discarded \n'
               'materials.',
  'methodology': '- \n'
                 'Preparation and implementation of Site facilities Plan for site workers \n'
                 ' \n'
                 '- \n'
                 'Following objectives shall be achieved by the facility plan \n'
                 ' \n'
                 '- \n'
                 'Providing suitable accommodation for construction workers within the site or \n'
                 'temporarily lease premises closer to the site \n'
                 ' \n'
                 '- \n'
                 'Providing Septic tanks to prevent pollution caused by sewer mixing to the rain \n'
                 'water drains \n'
                 ' \n'
                 '- \n'
                 'Preventing site pollution, air pollution by introducing proper garbage '
                 'disposal \n'
                 'system and preventing open burning of garbage \n'
                 ' \n'
                 '- \n'
                 'Providing health and sanitary facilities for site workers and safety '
                 'facilities \n'
                 'and maintaining safety. \n'
                 ' \n'
                 '- \n'
                 'Preventing mosquito breeding at site by avoiding water stagnate in the site \n'
                 '01 Mark',
  'maximum_marks': 1.0,
  'source_page': 22,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Preparation and implementation of Site facilities Plan for site '
                               'workers \n'
                               ' \n'
                               '- \n'
                               'Following objectives shall be achieved by the facility plan \n'
                               ' \n'
                               '- \n'
                               'Providing suitable accommodation for construction workers within '
                               'the site or \n'
                               'temporarily lease premises closer to the site \n'
                               ' \n'
                               '- \n'
                               'Providing Septic tanks to prevent pollution caused by sewer mixing '
                               'to the rain \n'
                               'water drains \n'
                               ' \n'
                               '- \n'
                               'Preventing site pollution, air pollution by introducing proper '
                               'garbage disposal \n'
                               'system and preventing open burning of garbage \n'
                               ' \n'
                               '- \n'
                               'Providing health and sanitary facilities for site workers and '
                               'safety facilities \n'
                               'and maintaining safety. \n'
                               ' \n'
                               '- \n'
                               'Preventing mosquito breeding at site by avoiding water stagnate in '
                               'the site',
             'marks': 1.0}],
  'da_documents': ['The layout of the location of the staff and workersâ€™ facilities, including '
                   'health and sanitation.'],
  'cva_documents': ['Report certified by a qualified person including photographs and site '
                    'records.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM9',
  'criterion_name': 'Minimizing the Use of Private Vehicles and Encouraging Public',
  'objective': 'To reduce pollution caused by increased usage of motor vehicles during a new '
               'construction \n'
               'of the building by the planning of using public transportation in the initial '
               'design phase.',
  'methodology': '* There shall be an existing or proposed bus stop within 250 meters to the '
                 'site \n'
                 ' \n'
                 '- \n'
                 'Minimize the pollution caused by the Traffic and to reduce impact caused by \n'
                 'land development, transportation system to the site shall be designed with \n'
                 'minimum distance main transport stream and integrated transport system with \n'
                 'adjacent building and reserved parking lots without separation walls \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 '- \n'
                 'To promote the use of green vehicles. (E.g., hybrid or electric vehicles) \n'
                 '- \n'
                 'Providing suitable parking places for green vehicles \n'
                 ' \n'
                 '- \n'
                 'Separation parking places for green vehicles shall be designed in the Project \n'
                 'Concept Design stage and to encourage further use of green vehicles parking \n'
                 'places shall be at areas closer to the elevators. \n'
                 ' \n'
                 '- \n'
                 'Providing charging centers for electric vehicles inside the site premises \n'
                 '01 Mark',
  'maximum_marks': 2.0,
  'source_page': 23,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'There shall be an existing or proposed bus stop within 250 meters '
                               'to the site \n'
                               ' \n'
                               '- \n'
                               'Minimize the pollution caused by the Traffic and to reduce impact '
                               'caused by \n'
                               'land development, transportation system to the site shall be '
                               'designed with \n'
                               'minimum distance main transport stream and integrated transport '
                               'system with \n'
                               'adjacent building and reserved parking lots without separation '
                               'walls - \n'
                               'To promote the use of green vehicles. (E.g., hybrid or electric '
                               'vehicles) \n'
                               '- \n'
                               'Providing suitable parking places for green vehicles \n'
                               ' \n'
                               '- \n'
                               'Separation parking places for green vehicles shall be designed in '
                               'the Project \n'
                               'Concept Design stage and to encourage further use of green '
                               'vehicles parking \n'
                               'places shall be at areas closer to the elevators. \n'
                               ' \n'
                               '- \n'
                               'Providing charging centers for electric vehicles inside the site '
                               'premises',
             'marks': 1.0}],
  'da_documents': ['Building orientation on land, existing and proposed public transportation plan '
                   '(Google map view is sufficient).',
                   'An number of minimum parking spaces.',
                   'Proposal for parking allocated for 5% of the long-term residents'],
  'cva_documents': ['As build plan confirmed with photographs including transportation facilities.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM10',
  'criterion_name': 'â€“ Parking Capacity',
  'objective': 'To reduce pollution caused by individual vehicles and to reduce urban traffic '
               'congestion by \n'
               'encouraging the use of carpooling and public transport facilities. A minimum '
               'number of \n'
               'parking slots should be provided as per requirement at the initial design phase.',
  'methodology': 'To prevent providing access parking plots \n'
                 ' \n'
                 '* Provided â‰¥2% of the parking space for carpools and vanpools \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 '* Provided â‰¥5% of the parking space for carpools and vanpools \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 24,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'To prevent providing access parking plots', 'marks': None},
            {'condition_text': 'Provided â‰¥2% of the parking space for carpools and vanpools',
             'marks': 1.0},
            {'condition_text': 'Provided â‰¥5% of the parking space for carpools and vanpools',
             'marks': 2.0}],
  'da_documents': ['Layout of the parking facilities allocated for carpools and vanpools and '
                   'calculation of percentage to obtain marks'],
  'cva_documents': ['As build drawing of the parking facilities allocated for carpools and '
                    'vanpools and calculation of percentage to obtain marks',
                    'Confirmation from a qualified person on the calculation of parking places '
                    'provided.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM11',
  'criterion_name': 'â€“ Rain Water Drainage Plan - Quantity and Quality Control',
  'objective': 'Minimizing the impact caused by the reduction of water perforation to the ground '
               'due to the \n'
               'construction of buildings and managing the excess rain water. In the initial '
               'design stage, a \n'
               'mechanism shall be designed to manage the quantity and quality of the rainwater by '
               'retaining \n'
               'the water and by increasing the ground absorption.',
  'methodology': 'Measures to control the amount of water caused by 50mm rainfall should be '
                 'submitted. \n'
                 ' \n'
                 '* In case of current surface, perforation is less than 50%, to maintain the '
                 'surface water \n'
                 'run off same as before the construction of the building \n'
                 ' \n'
                 '* In the case of a current surface, perforation is more than 50%, to reduce the '
                 'surface \n'
                 'water runoff by 25% after completion of the building.',
  'maximum_marks': 2.0,
  'source_page': 25,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Measures to control the amount of water caused by 50mm rainfall '
                               'should be submitted.',
             'marks': None},
            {'condition_text': 'In case of current surface, perforation is less than 50%, to '
                               'maintain the surface water \n'
                               'run off same as before the construction of the building',
             'marks': None},
            {'condition_text': 'In the case of a current surface, perforation is more than 50%, to '
                               'reduce the surface \n'
                               'water runoff by 25% after completion of the building.',
             'marks': None}],
  'da_documents': ['Preliminary study report on rainwater drainage plan'],
  'cva_documents': ['A full report including photographs and site records certified by a qualified '
                    'person 2.Additions and alterations were done to submitted information for '
                    'evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM12',
  'criterion_name': 'â€“ Green Covers and Roofs',
  'objective': 'Minimizing the impact of temperature on Human settlements, wildlife habitat, and \n'
               'microclimate by reducing the heat island effect. \n'
               ' \n'
               'To create an appropriate environment with suitable solar reflective indicators '
               '(Solar \n'
               'Reflectance Index - SRI) in the conceptual planning stage and ensure compliance of '
               'suitable \n'
               'materials and encourage the use of a flat green roof.',
  'methodology': 'i. Encouraging green covers on hard landscapes. \n'
                 ' \n'
                 'Use any of the following strategies for 50% of hard landscape areas surrounding '
                 'the building \n'
                 '(roads, footpaths, courtyards and parking areas) \n'
                 ' \n'
                 '* Planting of shady plants to provide shade to the hard landscape \n'
                 ' \n'
                 '* Use of paving materials with solar reflectance index 29 \n'
                 '01 Mark \n'
                 ' \n'
                 ' \n'
                 'ii. Use of Roof Covers / Canopies \n'
                 ' \n'
                 'The roofs with angle less than 10 degrees is considered as canopy (Roof with '
                 'less angle) \n'
                 ' \n'
                 'a. 75% of the total roof area with shallow and sharply angled roof canopies with '
                 'Solar \n'
                 'Reflectance Index (SRI) 78% and 29% respectively \n'
                 ' \n'
                 'b. For green roof and other roofs \n'
                 ' \n'
                 'Solar reflective index rain water + area of green roofs \n'
                 '___________________________ \n'
                 '____________________ \n'
                 '> total area of the roofs \n'
                 ' \n'
                 ' 0.75 \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' 0.5 \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '* Minimum 75% of the total roof area with shallow and sharply angled roof '
                 'canopies \n'
                 'with Solar Reflectance index (SRI) 78% and 29% respectively \n'
                 ' \n'
                 '* Minimum 50% of the roof area shall be covered with plants. Suitable plans for '
                 'roof \n'
                 'gardens shall be used. \n'
                 '01 Mark \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' SM12 â€“ Green Covers and Roofs \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 26,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'i. Encouraging green covers on hard landscapes. \n'
                               ' \n'
                               'Use any of the following strategies for 50% of hard landscape '
                               'areas surrounding the building \n'
                               '(roads, footpaths, courtyards and parking areas)',
             'marks': None},
            {'condition_text': 'Planting of shady plants to provide shade to the hard landscape',
             'marks': None},
            {'condition_text': 'Use of paving materials with solar reflectance index 29 ii. Use of '
                               'Roof Covers / Canopies \n'
                               ' \n'
                               'The roofs with angle less than 10 degrees is considered as canopy '
                               '(Roof with less angle) \n'
                               ' \n'
                               'a. 75% of the total roof area with shallow and sharply angled roof '
                               'canopies with Solar \n'
                               'Reflectance Index (SRI) 78% and 29% respectively \n'
                               ' \n'
                               'b. For green roof and other roofs \n'
                               ' \n'
                               'Solar reflective index rain water + area of green roofs \n'
                               '___________________________ \n'
                               '____________________ \n'
                               '> total area of the roofs \n'
                               ' \n'
                               ' 0.75 \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' 0.5',
             'marks': 1.0},
            {'condition_text': 'Minimum 75% of the total roof area with shallow and sharply angled '
                               'roof canopies \n'
                               'with Solar Reflectance index (SRI) 78% and 29% respectively',
             'marks': None},
            {'condition_text': 'Minimum 50% of the roof area shall be covered with plants. '
                               'Suitable plans for roof \n'
                               'gardens shall be used. SM12 â€“ Green Covers and Roofs',
             'marks': 1.0}],
  'da_documents': ['Site layout with proposed green cover plan and the hard landscape plan shown '
                   'with the roof plan drawn to scale',
                   'Cross Section of the green roof drawn to scale',
                   'List of names of proposed plants, planting schedule and planting pallet '
                   'elaborating the features of the pants, height, form etc.'],
  'cva_documents': ['The materials used and the solar reflectance index (Solar Reflectance Index - '
                    'SRI) value list, roof construction drawings with plans and cross sections',
                    'Photographs of materials used for roofs',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SM',
  'category_name': 'Sustainable Land Management and Planning',
  'criterion_code': 'SM13',
  'criterion_name': 'â€“ User Manual for Building Users',
  'objective': 'Preparation of a user manual to provide information and as a guide to maintain '
               'performance \n'
               'for users including green building design, a list of features and strategies',
  'methodology': 'Preparation of user manual of the building',
  'maximum_marks': 1.0,
  'source_page': 28,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Preparation of user manual of the building', 'marks': None}],
  'da_documents': ['Contribution to development of the framework and content of the user manual of '
                   'the building'],
  'cva_documents': ['Building userâ€™s manual',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR1',
  'criterion_name': 'Re-use and selection of materials',
  'objective': 'To encourage reuse of materials as much as possible to reduce the demand for '
               'natural \n'
               'resources used as building materials,',
  'methodology': 'Materials to the value of â‰¥ 2% of total value of the project should be reused '
                 'material. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Marks \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Or \n'
                 'Materials to the value of â‰¥ 5% of total value of the project should be reused '
                 'material. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 29,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Materials to the value of â‰¥ 2% of total value of the project '
                               'should be reused material. Or \n'
                               'Materials to the value of â‰¥ 5% of total value of the project '
                               'should be reused material.',
             'marks': 1.0}],
  'da_documents': ['List of materials proposed to be re-used in the project',
                   'Estimated cost of the proposed re-used materials',
                   'Estimated cost of the Building materials proposed to be re-used in the project '
                   'MR1- Re-use and selection of materials 02 Marks MR Building Materials & '
                   'Resources'],
  'cva_documents': ['Photographs of reused materials during construction 2.List of materials '
                    'reused and available locations of reused materials in the building.',
                    'Cost of re-used materials and restoration cost of the material',
                    'Cost of the Building materials used in the project',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR2',
  'criterion_name': 'Meterial Containing recycled substance.',
  'objective': 'Encouraging designers to use of recycled materials as much as possible to reduce '
               'the demand \n'
               'for natural resources used as building materials,',
  'methodology': '1. Use of recycled material of â‰¥ 2% of the total value of the building \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 '2. Use of recycled material of â‰¥ 5% of the total value of the building \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 31,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': '1. Use of recycled material of â‰¥ 2% of the total value of the '
                               'building 2. Use of recycled material of â‰¥ 5% of the total value of '
                               'the building',
             'marks': 1.0}],
  'da_documents': ['Document of items content of recycled material',
                   'Percentage of the cost of the recycled material before construction and after '
                   'construction of the building',
                   'Content of the sources of recycled materials and suppliersâ€™ Details',
                   'A document stating estimated cost of the materials used in the project against '
                   'estimated cost of recycled material.'],
  'cva_documents': ['A document containing details of materials containing recycled materials '
                    're-used in the construction phase along with photographs.',
                    'Calculation of the amount of recycled material contained in each material '
                    'used',
                    'Sources of materials content of recycled materials/suppliersâ€™ details',
                    'A document calculating the percentage of the cost of recycled materials on '
                    'the total cost of materials used for the project.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR3',
  'criterion_name': 'Re-use of existing buildings',
  'objective': 'Increasing the lifespan of the building is expected by conservation of building '
               'structures, \n'
               'conservation of resources, maintenance of cultural values, reducing waste '
               'generation by \n'
               'increase the percentage of re-use of existing buildings, conservation and '
               'redevelopment. It is \n'
               'also expected to minimize the damage caused to the environment in the new '
               'construction and \n'
               'transformation.',
  'methodology': '* Re-use of 30% - 49% of the area of existing building \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '* Re-use of 50% or more than 50% of the area of existing building \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 32,
  'scoring_status': 'partially_defined',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Re-use of 30% - 49% of the area of existing building',
             'marks': 1.0},
            {'condition_text': 'Re-use of 50% or more than 50% of the area of existing building',
             'marks': 2.0}],
  'da_documents': ['Plan of existing building used for development project',
                   'Proposed re-used parts shows in different colors and proposed used of the '
                   'reused area'],
  'cva_documents': ['As built drawing of re-used building and how it was used']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR4',
  'criterion_name': 'Regionally Available Materials for Building Construction',
  'objective': 'To encourage the use of regionally available materials in new building '
               'construction, \n'
               'conservation and refurbishment of existing buildings to minimize environmental '
               'impact in \n'
               'the transportation of building materials.',
  'methodology': '* Use of at least 10% of total cost of the material from regionally available '
                 'materials \n'
                 '(within 200km) \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 '* Use of at least 20% of total cost of the material from regionally available '
                 'materials \n'
                 '(within a 200km) \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks \n'
                 ' \n'
                 '* Use of at least 30% of total cost of the material from regionally available '
                 'materials \n'
                 '(within a 200km) \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '03 Marks',
  'maximum_marks': 3.0,
  'source_page': 33,
  'scoring_status': 'partially_defined',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Use of at least 10% of total cost of the material from regionally '
                               'available materials \n'
                               '(within 200km)',
             'marks': 1.0},
            {'condition_text': 'Use of at least 20% of total cost of the material from regionally '
                               'available materials \n'
                               '(within a 200km)',
             'marks': 2.0},
            {'condition_text': 'Use of at least 30% of total cost of the material from regionally '
                               'available materials \n'
                               '(within a 200km)',
             'marks': 3.0}],
  'da_documents': ['List and details of local raw materials and materials used in this project',
                   'Provide the following: * Name of the Product * Production cost The distance to '
                   'the manufacture from project site',
                   'Estimated total cost of the materials',
                   'Percentage of the cost of proposed local materials from total cost of the '
                   'material MR4 - Regionally Available Materials for Building Construction 03 '
                   'Marks'],
  'cva_documents': ['Details of the local material production shall be given with following '
                    'details * Distance to the local material manufacturer * Percentage of the '
                    'cost of building materials used in construction using local raw materials '
                    'from total cost of the materials used',
                    'Calculation of total cost of the raw material',
                    'Costs of local material as a percentage of the total cost of the materials',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR5',
  'criterion_name': 'Sustainable Timber',
  'objective': 'Reducing the devastating impact on the natural forest by growing trees with the '
               'high growth \n'
               'rate for timber and use of timber through scientifically accurate quality methods, '
               'increasing \n'
               'the lifespan of the wood.',
  'methodology': 'Use of 100% of total timber requirement through certified quality timber '
                 'products. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Taking above mention requirement into consideration in accordance with the '
                 'Timber \n'
                 'Corporation classification of timber for green building; \n'
                 ' \n'
                 'Using of class 3 timber \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 'Using of class 2 timber \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks \n'
                 'Using of class 1 timber \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '03 Marks',
  'maximum_marks': 3.0,
  'source_page': 35,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Use of 100% of total timber requirement through certified quality '
                               'timber products. \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Taking above mention requirement into consideration in accordance '
                               'with the Timber \n'
                               'Corporation classification of timber for green building; \n'
                               ' \n'
                               'Using of class 3 timber Using of class 2 timber Using of class 1 '
                               'timber',
             'marks': 1.0}],
  'da_documents': ['List of all timber products proposed for the project with estimated cost'],
  'cva_documents': ['Permits and classification certificated for timber produced by Timber '
                    'Corporation and Forest Department for used timber',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR6',
  'criterion_name': 'Use of High Value Green Building Materials',
  'objective': 'Encouraging the use of high green value material in development projects to '
               'minimize the \n'
               'damage caused to the environment and to the people who use buildings.',
  'methodology': 'According to the CIDA specifications of Green Value measurement of the '
                 'buildings \n'
                 ' \n'
                 'Using of materials with â‰¥ 2.5% green value 20%-40% of total material cost \n'
                 ' \n'
                 '01 Mark \n'
                 'Use of materials with â‰¥ 2.5% green value 40%-60% of total material cost \n'
                 '02 Marks \n'
                 'Using of materials with â‰¥ 2.5% green value â‰¥ 60% of total material cost \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '03 Marks',
  'maximum_marks': 2.0,
  'source_page': 36,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'According to the CIDA specifications of Green Value measurement of '
                               'the buildings \n'
                               ' \n'
                               'Using of materials with â‰¥ 2.5% green value 20%-40% of total '
                               'material cost Use of materials with â‰¥ 2.5% green value 40%-60% of '
                               'total material cost Using of materials with â‰¥ 2.5% green value â‰¥ '
                               '60% of total material cost',
             'marks': 1.0}],
  'da_documents': ['List of building materials with â‰¥ 2.5 green value.',
                   'Documents to support calculation of green value with the following content a. '
                   'Description of materials b. Energy consumption and CO2 emission c. Chemical '
                   'reaction and raw material content d. Maintenance requirements e. Emission of '
                   'chemicals during usage f. Final value'],
  'cva_documents': ['List of building materials with â‰¥ 2.5 green value',
                    'Document stating calculation of building green value of materials used with '
                    'following content a. Description of raw materials b. Energy consumption and '
                    'CO2 emission c. Chemical reaction and raw material content d. Maintenance '
                    'requirements e. Emission of chemicals during usage. f. final value',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR7',
  'criterion_name': 'Construction Waste Management',
  'objective': 'Encouraging to devise a program to manage construction waste by minimizing of \n'
               'construction waste production, recycle and disposal, utilization of construction '
               'waste as a \n'
               'filling material',
  'methodology': '1. Recycling â‰¥ 25% of nonhazardous construction waste or convert to salvaged \n'
                 'material \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 '2. Recycling â‰¥ 50% of nonhazardous construction waste or convert to salvaged '
                 'material\n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 37,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': '1. Recycling â‰¥ 25% of nonhazardous construction waste or convert '
                               'to salvaged \n'
                               'material 2. Recycling â‰¥ 50% of nonhazardous construction waste or '
                               'convert to salvaged material',
             'marks': 1.0}],
  'da_documents': ['Preparation of table of materials proposed to convert into salvage material, '
                   'for recycle and used for ground filling and calculation of quantity'],
  'cva_documents': ['Reports to confirm, the quantity of salvage material, recycled material, '
                    'materials used for filling according to the construction waste management '
                    'plan.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'MR',
  'category_name': 'Building Materials & Resources',
  'criterion_code': 'MR8',
  'criterion_name': 'Refrigerants & Clean Agents',
  'objective': 'To encourage use of materials with zero entry ozone compounds and compounds that \n'
               'minimize the global warming and to identify the above materials',
  'methodology': '1. Use of Refrigerants & Clean Agents with global warming index less than 2000 '
                 'but \n'
                 'not more than 700 \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '2. using of natural (not made artificially) zero Ozone compounds and using of \n'
                 'Refrigerants & Clean Agents with global warming index less than 700 \n'
                 '02 Marks',
  'maximum_marks': 3.0,
  'source_page': 38,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': '1. Use of Refrigerants & Clean Agents with global warming index '
                               'less than 2000 but \n'
                               'not more than 700 2. using of natural (not made artificially) zero '
                               'Ozone compounds and using of \n'
                               'Refrigerants & Clean Agents with global warming index less than '
                               '700',
             'marks': 1.0}],
  'da_documents': ['Specifications of proposed Refrigerants and /or Refrigerants and clean agents '
                   'presently used.'],
  'cva_documents': ['Specifications and list of used Refrigerants and clean agents',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ1',
  'criterion_name': 'â€“ Monitoring and Controlling of CO2',
  'objective': 'Improving the health condition of the building uses by providing good ventilation '
               'system by \n'
               'measuring CO2 content.',
  'methodology': 'Installation of CO2 gauges inside the building where internal air exhausted out '
                 'of the building \n'
                 'maintain the CO2 content < 1000 ppm',
  'maximum_marks': 2.0,
  'source_page': 39,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Installation of CO2 gauges inside the building where internal air '
                               'exhausted out of the building \n'
                               'maintain the CO2 content < 1000 ppm',
             'marks': None}],
  'da_documents': ['Documents on CO2 sensor equipment installed to monitor and control the CO2 '
                   'content'],
  'cva_documents': ['Specifications of CO2 sensors and control units in the building',
                    'Brief description of CO2 controlling and monitoring system, equipment and '
                    'itsâ€™ locations',
                    'Manufacturers details and specifications of the equipment',
                    'Photographs of the equipment and their locations.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ2',
  'criterion_name': 'â€“ Indoor Air Polutants',
  'objective': 'To minimize adverse health effects of the building users by minimizing the use of '
               'volatile \n'
               'organic compounds (VOC).',
  'methodology': 'Wall paints, other applications, and flooring are considered in this \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '* Using of paints, carpets and other flooring materials contain low VOC \n'
                 '01 Mark \n'
                 ' \n'
                 '* Not using materials with urea and formaldehyde for building construction \n'
                 '01 Mark',
  'maximum_marks': 2.0,
  'source_page': 40,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Wall paints, other applications, and flooring are considered in '
                               'this',
             'marks': None},
            {'condition_text': 'Using of paints, carpets and other flooring materials contain low '
                               'VOC',
             'marks': 1.0},
            {'condition_text': 'Not using materials with urea and formaldehyde for building '
                               'construction',
             'marks': 1.0}],
  'da_documents': ['Test report shall be submitted to the effect that the proposed paints and '
                   'other applications are free of VOC and formaldehyde'],
  'cva_documents': ['Drawing of the building where low amount VOC materials used',
                    'A list of low VOC materials used, and itsâ€™ specifications',
                    'description of the material manufacturer certification and test reports of '
                    'the low VOC materials used, to be eligible for marks',
                    'photographs of sections established with minimum VOC materials.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ3',
  'criterion_name': 'â€“Design and Installation of Optimum Temperature Control Units',
  'objective': 'To maintain the efficiency and comfort of building users by providing a user '
               'comfort \n'
               'temperature through designing and maintaining an optimum temperature in the '
               'building',
  'methodology': 'Installing an HVAC system of the building to maintain the building interior '
                 'temperature in \n'
                 'optimum level, and to achieve the external cover ASHRAE level 55-2004 '
                 '(Temperature \n'
                 'comfort level) and installment of equipment to control and measure optimum '
                 'temperature \n'
                 'level \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 41,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Installing an HVAC system of the building to maintain the building '
                               'interior temperature in \n'
                               'optimum level, and to achieve the external cover ASHRAE level '
                               '55-2004 (Temperature \n'
                               'comfort level) and installment of equipment to control and measure '
                               'optimum temperature \n'
                               'level',
             'marks': 2.0}],
  'da_documents': ['Details of the design used to maintain ASHRAE standards 55 â€“ 2004 levels'],
  'cva_documents': ['As built drawing of installed equipment to measure and control optimum '
                    'temperature level to achieve building ASHRAE level 55-2004 of human comfort '
                    'level',
                    'Temperature data taken during a period of 72 Hrs 3.Temperature data of spaces '
                    'individually and group used',
                    'Photographs of control sensors fixed.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ4',
  'criterion_name': 'â€“ Air Change Effectiveness',
  'objective': 'Avoid mixing of inflow and exhausted air to maintain a better ventilation system '
               'in the \n'
               'building.',
  'methodology': 'To achieve following air quality, of 90% area of the building. Design of the air '
                 'supply unit of \n'
                 'the building to ACE > 0.95 \n'
                 '01 Mark \n'
                 ' \n'
                 'Air change effectiveness â€“ (ACE) measure from 1m height from the finish floor '
                 'level \n'
                 'ASHRAE 129-1997',
  'maximum_marks': 1.0,
  'source_page': 42,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'To achieve following air quality, of 90% area of the building. '
                               'Design of the air supply unit of \n'
                               'the building to ACE > 0.95 Air change effectiveness â€“ (ACE) '
                               'measure from 1m height from the finish floor level \n'
                               'ASHRAE 129-1997',
             'marks': 1.0}],
  'da_documents': ['Summary report of the system used to optimize the air quality of the each '
                   'space',
                   'Design of the ventilation system to achieve marks'],
  'cva_documents': ['Ventilation system installation diagram 2 Summary report on system installed '
                    'to optimize the air quality of the each space of the building',
                    'Measurement chart 4.Additions and alterations were done to submitted '
                    'information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ5',
  'criterion_name': 'â€“ Day Light',
  'objective': 'To encourage the use of daylight inside the building',
  'methodology': '* To maintain the daylight lux level measured from 800 mm above the finished '
                 'ground \n'
                 'level of the building at 2% and to light up â‰¥ 30% of the total building area '
                 'from \n'
                 'daylight \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 'Or \n'
                 ' \n'
                 '* To maintain the daylight lux level measured from 800mm s above the finished '
                 'ground \n'
                 'level of the building at 2% light up â‰¥ 50% of the total building area from '
                 'daylight \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 43,
  'scoring_status': 'partially_defined',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'To maintain the daylight lux level measured from 800 mm above the '
                               'finished ground \n'
                               'level of the building at 2% and to light up â‰¥ 30% of the total '
                               'building area from \n'
                               'daylight Or',
             'marks': 1.0},
            {'condition_text': 'To maintain the daylight lux level measured from 800mm s above the '
                               'finished ground \n'
                               'level of the building at 2% light up â‰¥ 50% of the total building '
                               'area from daylight',
             'marks': 2.0}],
  'da_documents': ['Summary report and design drawings of the light intake into the building '
                   'include glare control strategy'],
  'cva_documents': ['As built drawing showing the installed daylight intake system',
                    'Layout with the daylight lux level at every area',
                    'Building layout with solar diagram and sun path including the heights of the '
                    'existing and proposed buildings',
                    'Summary of daylight lux level',
                    'Photographs of each equipment fixed',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ6',
  'criterion_name': 'â€“ Controlling the Glare of Intake Sunlight',
  'objective': 'Establishment of glare cut off system of the daylight',
  'methodology': 'Cutting off uncomfortable glare on external glass facia of the building by using '
                 'blinds or \n'
                 'covers \n'
                 ' \n'
                 '1. Avoiding of direct sunlight flow to the internal spaces of the building and '
                 'maintaining \n'
                 'the lux level at less than 2000 \n'
                 ' \n'
                 '2. Avoiding direct sunlight flow to the building user by maintaining the light '
                 'direction \n'
                 'angle at 15-60 degrees (measured from 1.2m of the finished ground level) \n'
                 ' \n'
                 'Suitable trees can be planted to cut off the direct sunlight flow to the '
                 'building \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '3. Avoiding direct sunlight and obtaining a minimum of lux level â‰¥2% of 75% of '
                 'the \n'
                 'total building area',
  'maximum_marks': 1.0,
  'source_page': 44,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Cutting off uncomfortable glare on external glass facia of the '
                               'building by using blinds or \n'
                               'covers \n'
                               ' \n'
                               '1. Avoiding of direct sunlight flow to the internal spaces of the '
                               'building and maintaining \n'
                               'the lux level at less than 2000 \n'
                               ' \n'
                               '2. Avoiding direct sunlight flow to the building user by '
                               'maintaining the light direction \n'
                               'angle at 15-60 degrees (measured from 1.2m of the finished ground '
                               'level) \n'
                               ' \n'
                               'Suitable trees can be planted to cut off the direct sunlight flow '
                               'to the building \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               '3. Avoiding direct sunlight and obtaining a minimum of lux level '
                               'â‰¥2% of 75% of the \n'
                               'total building area',
             'marks': None}],
  'da_documents': ['1.Description of daylight control system',
                   'A summary report confirming on daylight intake when the daylight glare control '
                   'system is activated.'],
  'cva_documents': ['As built drawing of the building ensuring the original design has been '
                    'followed',
                    'A summary report and certification on daylight intake when daylight control '
                    'system is in function',
                    'Description of system installed',
                    'Photographs of different types of glacer control systems installed.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ7',
  'criterion_name': 'â€“ Electrical Lighting Level',
  'objective': 'To encourage designing of effective and efficient electrical lighting systems',
  'methodology': 'To achieve final amended standard issued by Sustainable Energy Authority',
  'maximum_marks': 1.0,
  'source_page': 45,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'To achieve final amended standard issued by Sustainable Energy '
                               'Authority',
             'marks': None}],
  'da_documents': ['Brief description on lighting design'],
  'cva_documents': ['As built drawing of the lighting design',
                    'Lux gauge explain the lighting level to obtain marks',
                    'Photographs of established lighting system',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ8',
  'criterion_name': 'â€“ Internal and External views',
  'objective': 'To preserve the physical and mental fitness of the building users and to reduce '
               'the eyestrain \n'
               'of the users, protect the natural environment and the views. Selecting external '
               'views suitable \n'
               'for the building when designing a building.',
  'methodology': 'Taking borrowed views of the surrounding landscape by minimizing the external '
                 'solid walls \n'
                 'and internal partitions \n'
                 ' \n'
                 '* Designing a direct view paths 1.2m from the finished floor level of 60% of the '
                 'total \n'
                 'building area',
  'maximum_marks': 1.0,
  'source_page': 46,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Taking borrowed views of the surrounding landscape by minimizing '
                               'the external solid walls \n'
                               'and internal partitions',
             'marks': None},
            {'condition_text': 'Designing a direct view paths 1.2m from the finished floor level '
                               'of 60% of the total \n'
                               'building area',
             'marks': None}],
  'da_documents': ['Floor layout marked with external views',
                   'Internal arrangement of the building with external framed view'],
  'cva_documents': ['As built drawing showing the external spaces views of the building',
                    'As-built drawings and photographs of the building showing outside views from '
                    'the interior',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'EQ',
  'category_name': 'Quality of Internal Environment of the Building',
  'criterion_code': 'EQ9',
  'criterion_name': 'Internal Noise Level',
  'objective': 'To maintain the internal noise level of the building in user comfort level.',
  'methodology': '* High volume unrest those who lives in the internal environment. Therefore, '
                 'to \n'
                 'ensure maintaining the internal noise at acceptable level, 90% of the total \n'
                 'building interior space shall be at the noise level of GVB4/16 CIBSE Guide \n'
                 'B4: Noise and Vibration Control for Building Services System',
  'maximum_marks': 1.0,
  'source_page': 47,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'High volume unrest those who lives in the internal environment. '
                               'Therefore, to \n'
                               'ensure maintaining the internal noise at acceptable level, 90% of '
                               'the total \n'
                               'building interior space shall be at the noise level of GVB4/16 '
                               'CIBSE Guide \n'
                               'B4: Noise and Vibration Control for Building Services System',
             'marks': None}],
  'da_documents': ['A report on strategic plan including drawings to maintain the level of '
                   'internal noise at a given limit'],
  'cva_documents': ['Report with data sheet obtained by measuring the noise level to ensure the '
                    'achievement of required noise level',
                    'Photographs of materials facilitated sound control',
                    'Additions and alterations done to submitted information for evaluation']},
 {'category_code': 'WE',
  'category_name': 'Water Efficiency',
  'criterion_code': 'WE1',
  'criterion_name': 'Rain Water Harvesting',
  'objective': 'To reduce the amount of portable water usage, designing of a method to collect '
               'rainwater that \n'
               'flows over roof and ground runoff water.',
  'methodology': 'Percentage of rainwater collection into the total water requirement of the '
                 'building as follows \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 'Using of rain water 05% or above \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 'Using of rain water 10% or above \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks \n'
                 ' \n'
                 'Percentages shall be calculated referring to the usage of rainwater relative to '
                 'the basic water \n'
                 'needs of the building',
  'maximum_marks': 2.0,
  'source_page': 48,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Percentage of rainwater collection into the total water '
                               'requirement of the building as follows \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               ' \n'
                               'Using of rain water 05% or above Using of rain water 10% or above '
                               'Percentages shall be calculated referring to the usage of '
                               'rainwater relative to the basic water \n'
                               'needs of the building',
             'marks': 1.0}],
  'da_documents': ['Calculation of the total water requirement for each function of the building',
                   'Methodology of rainwater collection system 3 Rainwater collection capacity',
                   'Usage of collected rainwater in the building'],
  'cva_documents': ['As built drawing of rainwater storage tanks and installation method of the '
                    'rainwater collection system',
                    'Photographs of established system Accessories',
                    'Additions and alterations were done to submitted information for evaluation '
                    'WE - Water Efficiency']},
 {'category_code': 'WE',
  'category_name': 'Water Efficiency',
  'criterion_code': 'WE2',
  'criterion_name': 'â€“ Waste Water Recycling and Efficient Use',
  'objective': 'To reduce pollution caused by releasing wastewater into the environment by '
               'encouraging \n'
               'waste water recycling \n'
               'To reduce portable water consumption in the building, encourage reuse of recycled '
               'water for \n'
               'sanitary pipes, and for landscape watering by means of the irrigation system.',
  'methodology': 'Establishment of the treatment plant in the site for treating of waste water '
                 '(gray water / black \n'
                 'water) and reuse refined water for landscape watering and toilet flushing. By '
                 'selecting trees \n'
                 'and plants with less amount of water consumption and using of plants easily '
                 'adopted to the \n'
                 'ground condition of the site also reduce the amount of water need for landscape '
                 'watering. \n'
                 ' \n'
                 'Total wastewater volume of the building \n'
                 'Recycled â‰¥10% of total wastewater volume \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 'Recycled â‰¥30% of total wastewater volume \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks \n'
                 'Recycled â‰¥50% of total waste water volume \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '03 Marks \n'
                 'Refined â‰¥50% of the total wastewater volume and dispose to the environment \n'
                 ' 04 Marks',
  'maximum_marks': 4.0,
  'source_page': 49,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Establishment of the treatment plant in the site for treating of '
                               'waste water (gray water / black \n'
                               'water) and reuse refined water for landscape watering and toilet '
                               'flushing. By selecting trees \n'
                               'and plants with less amount of water consumption and using of '
                               'plants easily adopted to the \n'
                               'ground condition of the site also reduce the amount of water need '
                               'for landscape watering. \n'
                               ' \n'
                               'Total wastewater volume of the building \n'
                               'Recycled â‰¥10% of total wastewater volume Recycled â‰¥30% of total '
                               'wastewater volume Recycled â‰¥50% of total waste water volume '
                               'Refined â‰¥50% of the total wastewater volume and dispose to the '
                               'environment',
             'marks': 1.0}],
  'da_documents': ['Initial calculation of proposed water purification and recycling percentage',
                   'Technical report on wastewater treatment and recycling system, storage '
                   'facilities and distribution systems'],
  'cva_documents': ['A report on final calculation of percentage of water recycled or refined '
                    'after being installed the system',
                    'As built drawing of treatment plant, storage tanks, and wastewater treatment '
                    'methodology',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'WE',
  'category_name': 'Water Efficiency',
  'criterion_code': 'WE3',
  'criterion_name': 'Water Metering and Water Leaks Identification System',
  'objective': 'Encourage to design a water supply system with a proper supervision and management',
  'methodology': '1. Installing sub-gauges (sub-metering) water management and supervision systems '
                 'for \n'
                 'rented spaces in the same premises. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 '2. To limit water leakage and wastage by the positioning of EMS monitoring '
                 'system. Testing \n'
                 'for water leaks in every 2 years. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark',
  'maximum_marks': 2.0,
  'source_page': 50,
  'scoring_status': 'partially_defined',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': '1. Installing sub-gauges (sub-metering) water management and '
                               'supervision systems for \n'
                               'rented spaces in the same premises. 2. To limit water leakage and '
                               'wastage by the positioning of EMS monitoring system. Testing \n'
                               'for water leaks in every 2 years.',
             'marks': 1.0}],
  'da_documents': ['To limit water leakage and wastage positioning of EMS monitoring system. '
                   'Testing for water leaks and in every 2 years.'],
  'cva_documents': ['Installation of sub gauges (meters) and maintaining a data sheet',
                    'A map of sub-meter positions in the building',
                    'Photographs and a list of sub- meters.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'WE',
  'category_name': 'Water Efficiency',
  'criterion_code': 'WE4',
  'criterion_name': 'Water Efficient Equipment',
  'objective': 'Encouraging minimizing the consumption of pipe borne drinking water by using '
               'efficient \n'
               'Accessories',
  'methodology': 'Reduction of pipe borne water consumption of the building by using efficient '
                 'water \n'
                 'compartments, water basins, shower heads or bathing systems. Use of automatic '
                 'and sensor \n'
                 'controlled accessories to minimize the water wastage from accessories, â‰¥30% of '
                 'the \n'
                 'buildingâ€™s total accessories. \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '01 Mark \n'
                 ' \n'
                 'Reduction of pipe borne water consumption of the building by using of efficient '
                 'water \n'
                 'compartments, water basins, shower heads or bathing systems. Use of automatic '
                 'and sensor \n'
                 'controlled accessories to minimize the water wastage from accessories, â‰¥50% of '
                 'the \n'
                 'buildingâ€™s total accessories \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 ' \n'
                 '02 Marks',
  'maximum_marks': 2.0,
  'source_page': 51,
  'scoring_status': 'partially_defined',
  'automation_type': 'numeric_threshold',
  'notes': 'Parsed from UDA guideline text. Original condition text is preserved; machine-readable '
           'scoring rules are not finalized.',
  'rules': [{'condition_text': 'Reduction of pipe borne water consumption by using efficient water '
                               'compartments, water basins, shower heads or bathing systems, and '
                               'automatic/sensor controlled accessories for >=30% of the building '
                               'total accessories.',
             'marks': 1.0},
            {'condition_text': 'Reduction of pipe borne water consumption by using efficient water '
                               'compartments, water basins, shower heads or bathing systems, and '
                               'automatic/sensor controlled accessories for >=50% of the building '
                               'total accessories.',
             'marks': 2.0}],
  'da_documents': ['Short explanation on achievement of system requirement',
                   'A report on proposed equipment'],
  'cva_documents': ['Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'IN',
  'category_name': 'Green Innovation',
  'criterion_code': 'IN1',
  'criterion_name': 'Utilization of Innovations',
  'objective': 'In addition, to the requirements needed to be fulfilled in the green evaluation '
               'method, to \n'
               'appreciate unique inventions and identification of creative innovation in green '
               'buildings',
  'methodology': 'Innovations in project implementation to be presented in the following '
                 'sections. \n'
                 ' \n'
                 '* The introduction of new power generation sources and methods in the project. \n'
                 '* Eco-farming methods and landscape designs for interior and exterior of the '
                 'building. \n'
                 '(Micro Climate) \n'
                 '* Introduction of endothermic techniques for buildings \n'
                 '* Introduction of new building materials with more green value \n'
                 '* Introduction of self-cleaning surfaces for building exterior \n'
                 '* Introduction of a Low-energy ventilation system \n'
                 '* Introduction of a new structural design \n'
                 ' \n'
                 'Technical Committee will evaluate the above innovations under above listed 7 '
                 'main sections \n'
                 'to offer marks. \n'
                 ' \n'
                 'In order to achieve the maximum productivity, new innovations shall be '
                 'implemented at the \n'
                 'initial planning stage',
  'maximum_marks': 5.0,
  'source_page': 52,
  'scoring_status': 'requires_review',
  'automation_type': 'checklist',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Innovations in project implementation to be presented in the '
                               'following sections.',
             'marks': None},
            {'condition_text': 'The introduction of new power generation sources and methods in '
                               'the project.',
             'marks': None},
            {'condition_text': 'Eco-farming methods and landscape designs for interior and '
                               'exterior of the building. \n'
                               '(Micro Climate)',
             'marks': None},
            {'condition_text': 'Introduction of endothermic techniques for buildings',
             'marks': None},
            {'condition_text': 'Introduction of new building materials with more green value',
             'marks': None},
            {'condition_text': 'Introduction of self-cleaning surfaces for building exterior',
             'marks': None},
            {'condition_text': 'Introduction of a Low-energy ventilation system', 'marks': None},
            {'condition_text': 'Introduction of a new structural design \n'
                               ' \n'
                               'Technical Committee will evaluate the above innovations under '
                               'above listed 7 main sections \n'
                               'to offer marks. \n'
                               ' \n'
                               'In order to achieve the maximum productivity, new innovations '
                               'shall be implemented at the \n'
                               'initial planning stage',
             'marks': None}],
  'da_documents': ['Project report with certification for new innovation',
                   'Innovative proposals with detail drawing enabling to identify easily IN - '
                   'Green Innovation IN1 - Utilization of Innovations 05 Marks'],
  'cva_documents': ['Final project report with photographs to ensure the accuracy',
                    'Daily Maintenance Manual and documents.',
                    'Additions and alterations were done to submitted information for evaluation']},
 {'category_code': 'SC',
  'category_name': 'Socio-Cultural Compatibility',
  'criterion_code': 'SC1',
  'criterion_name': 'Design and Building of Socially and Culturally Compatible',
  'objective': 'The architecture of the proposed development shall be compatible with existing '
               'architectural \n'
               'context and social context (this covers historically, archeologically significant '
               'zones and \n'
               'zones with special architectural value).',
  'methodology': 'Confirmation that the site is in or not in a declared architecturally '
                 'significant zone at the \n'
                 'preliminary planning clearance stage and to confirm the proposed architectural '
                 'style is \n'
                 'socially and culturally compatible with the context.',
  'maximum_marks': 2.0,
  'source_page': 54,
  'scoring_status': 'requires_review',
  'automation_type': 'manual_review',
  'notes': 'Parsed from UDA guideline text; scoring bands or required documents require domain '
           'review before automation.',
  'rules': [{'condition_text': 'Confirmation that the site is in or not in a declared '
                               'architecturally significant zone at the \n'
                               'preliminary planning clearance stage and to confirm the proposed '
                               'architectural style is \n'
                               'socially and culturally compatible with the context.',
             'marks': None}],
  'da_documents': ['01.Certified document to confirm that the design is done accordance with '
                   'regulations of the declared zone (approved plans/documents)',
                   'Project report and drawings confirming that the design is compatible with '
                   'social and cultural characteristics of the context Documents/presentations '
                   'required for accuracy evaluation in completion of building construction (CVA)',
                   'A copy of the certificate of conformity for the project confirming that the '
                   'construction is in accordance with relevant regulations',
                   'As built drawings of the construction confirming that it is compatible with '
                   'Architectural characteristics and social characteristics of the surrounding '
                   'context',
                   'Additions and alterations were done to submitted information for evaluation SC '
                   '- Socio-Cultural Compatibility'],
  'cva_documents': []}]


def _clean_seed_text(value):
    if value is None:
        return value
    replacements = {
        'Ã¢\x80\x93': '-',
        'Ã¢\x80\x94': '-',
        'Ã¢\x80\x99': "'",
        'Ã¢\x80\x98': "'",
        'Ã¢\x80\x9c': '"',
        'Ã¢\x80\x9d': '"',
        'Ã¢\x89Â¥': '>=',
    }
    for source, replacement in replacements.items():
        value = value.replace(source, replacement)
    return ' '.join(value.split()) if '\n' not in value else value


UDA_MACHINE_RULES = {
    "EE3": [
        {
            "rule_order": 1,
            "operator": ">=",
            "threshold_value": 40,
            "threshold_unit": "%",
            "machine_rule_json": {
                "logic": "or",
                "conditions": [
                    {"metric": "solar_panel_plot_coverage_percentage", "operator": ">=", "value": 20, "unit": "%"},
                    {"metric": "electricity_contract_demand_met_by_solar_percentage", "operator": ">=", "value": 40, "unit": "%"},
                ],
            },
        },
        {
            "rule_order": 2,
            "operator": ">=",
            "threshold_value": 60,
            "threshold_unit": "%",
            "machine_rule_json": {
                "logic": "or",
                "conditions": [
                    {"metric": "solar_panel_plot_coverage_percentage", "operator": ">=", "value": 40, "unit": "%"},
                    {"metric": "electricity_contract_demand_met_by_solar_percentage", "operator": ">=", "value": 60, "unit": "%"},
                ],
            },
        },
        {
            "rule_order": 3,
            "operator": ">=",
            "threshold_value": 80,
            "threshold_unit": "%",
            "machine_rule_json": {
                "logic": "or",
                "conditions": [
                    {"metric": "solar_panel_plot_coverage_percentage", "operator": ">=", "value": 60, "unit": "%"},
                    {"metric": "electricity_contract_demand_met_by_solar_percentage", "operator": ">=", "value": 80, "unit": "%"},
                ],
            },
        },
        {
            "rule_order": 4,
            "operator": ">=",
            "threshold_value": 100,
            "threshold_unit": "%",
            "machine_rule_json": {
                "logic": "or",
                "conditions": [
                    {"metric": "solar_panel_plot_coverage_percentage", "operator": ">=", "value": 80, "unit": "%"},
                    {"metric": "electricity_contract_demand_met_by_solar_percentage", "operator": ">=", "value": 100, "unit": "%"},
                ],
            },
        },
    ],
    "EE4": [
        {"rule_order": 1, "operator": "range", "threshold_unit": "kWh/m2/year", "machine_rule_json": {"metric": "building_energy_index", "operator": "range", "min": 130, "max": 150, "unit": "kWh/m2/year"}},
        {"rule_order": 2, "operator": "range", "threshold_unit": "kWh/m2/year", "machine_rule_json": {"metric": "building_energy_index", "operator": "range", "min": 110, "max": 130, "unit": "kWh/m2/year"}},
        {"rule_order": 3, "operator": "range", "threshold_unit": "kWh/m2/year", "machine_rule_json": {"metric": "building_energy_index", "operator": "range", "min": 90, "max": 110, "unit": "kWh/m2/year"}},
    ],
    "EE6": [
        {"rule_order": 1, "operator": "range", "threshold_unit": "power factor", "machine_rule_json": {"metric": "power_factor_correction_accuracy", "operator": "range", "min": 0.98, "max": 1.0, "unit": " power factor"}},
    ],
    "EQ1": [
        {"rule_order": 1, "operator": "<", "threshold_value": 1000, "threshold_unit": "ppm", "machine_rule_json": {"metric": "co2_concentration_ppm", "operator": "<", "value": 1000, "unit": " ppm"}},
    ],
    "SM2": [
        {"rule_order": 1, "operator": "range", "threshold_unit": "%", "machine_rule_json": {"metric": "redeveloped_brownfield_land_percentage", "operator": "range", "min": 10, "max": 50, "unit": "%"}},
        {"rule_order": 2, "operator": "range", "threshold_unit": "%", "machine_rule_json": {"metric": "redeveloped_brownfield_land_percentage", "operator": "range", "min": 51, "max": 69, "unit": "%"}},
        {"rule_order": 3, "operator": ">=", "threshold_value": 70, "threshold_unit": "%", "machine_rule_json": {"metric": "redeveloped_brownfield_land_percentage", "operator": ">=", "value": 70, "unit": "%"}},
    ],
    "SM10": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 2, "threshold_unit": "%", "machine_rule_json": {"metric": "carpool_vanpool_parking_percentage", "operator": ">=", "value": 2, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 5, "threshold_unit": "%", "machine_rule_json": {"metric": "carpool_vanpool_parking_percentage", "operator": ">=", "value": 5, "unit": "%"}},
    ],
    "MR1": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 2, "threshold_unit": "%", "machine_rule_json": {"metric": "reused_material_value_percentage", "operator": ">=", "value": 2, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 5, "threshold_unit": "%", "machine_rule_json": {"metric": "reused_material_value_percentage", "operator": ">=", "value": 5, "unit": "%"}},
    ],
    "MR2": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 2, "threshold_unit": "%", "machine_rule_json": {"metric": "recycled_material_value_percentage", "operator": ">=", "value": 2, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 5, "threshold_unit": "%", "machine_rule_json": {"metric": "recycled_material_value_percentage", "operator": ">=", "value": 5, "unit": "%"}},
    ],
    "MR3": [
        {"rule_order": 1, "operator": "range", "threshold_unit": "%", "machine_rule_json": {"metric": "existing_building_reuse_area_percentage", "operator": "range", "min": 30, "max": 49, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 50, "threshold_unit": "%", "machine_rule_json": {"metric": "existing_building_reuse_area_percentage", "operator": ">=", "value": 50, "unit": "%"}},
    ],
    "MR4": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 10, "threshold_unit": "%", "machine_rule_json": {"metric": "regional_material_cost_percentage", "operator": ">=", "value": 10, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 20, "threshold_unit": "%", "machine_rule_json": {"metric": "regional_material_cost_percentage", "operator": ">=", "value": 20, "unit": "%"}},
        {"rule_order": 3, "operator": ">=", "threshold_value": 30, "threshold_unit": "%", "machine_rule_json": {"metric": "regional_material_cost_percentage", "operator": ">=", "value": 30, "unit": "%"}},
    ],
    "MR7": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 25, "threshold_unit": "%", "machine_rule_json": {"metric": "nonhazardous_construction_waste_recycled_percentage", "operator": ">=", "value": 25, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 50, "threshold_unit": "%", "machine_rule_json": {"metric": "nonhazardous_construction_waste_recycled_percentage", "operator": ">=", "value": 50, "unit": "%"}},
    ],
    "WE1": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 5, "threshold_unit": "%", "machine_rule_json": {"metric": "rainwater_use_percentage", "operator": ">=", "value": 5, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 10, "threshold_unit": "%", "machine_rule_json": {"metric": "rainwater_use_percentage", "operator": ">=", "value": 10, "unit": "%"}},
    ],
    "WE2": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 10, "threshold_unit": "%", "machine_rule_json": {"metric": "wastewater_recycled_percentage", "operator": ">=", "value": 10, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 30, "threshold_unit": "%", "machine_rule_json": {"metric": "wastewater_recycled_percentage", "operator": ">=", "value": 30, "unit": "%"}},
        {"rule_order": 3, "operator": ">=", "threshold_value": 50, "threshold_unit": "%", "machine_rule_json": {"metric": "wastewater_recycled_percentage", "operator": ">=", "value": 50, "unit": "%"}},
        {"rule_order": 4, "operator": ">=", "threshold_value": 50, "threshold_unit": "%", "machine_rule_json": {"metric": "wastewater_refined_and_disposed_percentage", "operator": ">=", "value": 50, "unit": "%"}},
    ],
    "WE4": [
        {"rule_order": 1, "operator": ">=", "threshold_value": 30, "threshold_unit": "%", "machine_rule_json": {"metric": "water_efficient_accessories_percentage", "operator": ">=", "value": 30, "unit": "%"}},
        {"rule_order": 2, "operator": ">=", "threshold_value": 50, "threshold_unit": "%", "machine_rule_json": {"metric": "water_efficient_accessories_percentage", "operator": ">=", "value": 50, "unit": "%"}},
    ],
}


UDA_MACHINE_RULE_MARKS = {
    "EE3": [2, 4, 6, 8],
    "EE4": [1, 3, 5],
    "EE6": [2],
    "EQ1": [2],
    "SM2": [1, 2, 3],
    "SM10": [1, 2],
    "MR1": [1, 2],
    "MR2": [1, 2],
    "MR3": [1, 2],
    "MR4": [1, 2, 3],
    "MR7": [1, 2],
    "WE1": [1, 2],
    "WE2": [1, 2, 3, 4],
    "WE4": [1, 2],
}


UDA_MANUAL_REVIEW_OVERRIDES = {
    "IN1": (
        "Manual review required. The UDA guideline states that green innovation "
        "marks are evaluated by the Technical Committee."
    ),
    "MR6": (
        "Manual review required. The guideline text depends on assessor "
        "verification of permitted material use and is not safely reducible to a "
        "deterministic machine rule in this phase."
    ),
    "MR8": (
        "Manual review required. The criterion heading shows 03 marks while the "
        "methodology lists scoring bands up to 02 marks; the inconsistency is "
        "preserved for assessor review."
    ),
}


# Cost levels are qualitative heuristic placeholders for this research prototype.
# They should be validated later with Sri Lankan construction industry experts.
UDA_RECOMMENDATION_KNOWLEDGE = {
    "EE3": {
        "recommendation_text": "Increase on-site renewable energy contribution to the next documented UDA solar-panel coverage or electricity contract-demand threshold.",
        "recommendation_type": "equipment_upgrade",
        "cost_level": "high",
        "implementation_difficulty": "difficult",
    },
    "EE4": {
        "recommendation_text": "Improve building energy performance so the Building Energy Index reaches the next documented UDA efficiency band.",
        "recommendation_type": "equipment_upgrade",
        "cost_level": "high",
        "implementation_difficulty": "difficult",
    },
    "SM2": {
        "recommendation_text": "Increase the percentage of redeveloped brownfield land toward the next documented UDA redevelopment threshold.",
        "recommendation_type": "design_change",
        "cost_level": "medium",
        "implementation_difficulty": "difficult",
    },
    "SM10": {
        "recommendation_text": "Reserve additional parking capacity for carpools or vanpools to reach the next documented UDA percentage threshold.",
        "recommendation_type": "design_change",
        "cost_level": "low",
        "implementation_difficulty": "moderate",
    },
    "MR1": {
        "recommendation_text": "Increase reused material value to the next documented UDA percentage of total project value.",
        "recommendation_type": "material_change",
        "cost_level": "low",
        "implementation_difficulty": "moderate",
    },
    "MR2": {
        "recommendation_text": "Increase recycled-content material value to the next documented UDA percentage of total building material value.",
        "recommendation_type": "material_change",
        "cost_level": "low",
        "implementation_difficulty": "moderate",
    },
    "MR3": {
        "recommendation_text": "Increase retained and reused existing-building area to the next documented UDA area threshold.",
        "recommendation_type": "design_change",
        "cost_level": "high",
        "implementation_difficulty": "difficult",
    },
    "MR4": {
        "recommendation_text": "Increase regionally available material cost share sourced within the documented UDA distance basis.",
        "recommendation_type": "material_change",
        "cost_level": "low",
        "implementation_difficulty": "moderate",
    },
    "MR7": {
        "recommendation_text": "Improve the construction waste management plan to recycle or salvage non-hazardous construction waste to the next documented threshold.",
        "recommendation_type": "operational",
        "cost_level": "very_low",
        "implementation_difficulty": "moderate",
    },
    "WE1": {
        "recommendation_text": "Increase rainwater harvesting contribution to the next documented percentage of total building water requirement.",
        "recommendation_type": "design_change",
        "cost_level": "medium",
        "implementation_difficulty": "moderate",
    },
    "WE2": {
        "recommendation_text": "Increase on-site wastewater recycling or refinement to the next documented UDA wastewater threshold.",
        "recommendation_type": "equipment_upgrade",
        "cost_level": "high",
        "implementation_difficulty": "difficult",
    },
    "WE4": {
        "recommendation_text": "Increase efficient or sensor-controlled water accessories to the next documented percentage of total accessories.",
        "recommendation_type": "equipment_upgrade",
        "cost_level": "medium",
        "implementation_difficulty": "easy",
    },
}


def _machine_condition_text(machine_rule):
    rule = machine_rule["machine_rule_json"]
    if rule.get("logic") == "or":
        parts = [
            f"{condition['metric']} {condition['operator']} {condition['value']}{condition.get('unit', '')}"
            for condition in rule["conditions"]
        ]
        return " OR ".join(parts)
    if rule["operator"] == "range":
        return (
            f"{rule['metric']} between {rule['min']} and {rule['max']} "
            f"{rule.get('unit', '')}".strip()
        )
    return (
        f"{rule['metric']} {rule['operator']} {rule['value']} "
        f"{rule.get('unit', '')}".strip()
    )


def seed_uda_data(db=None):
    owns_session = db is None
    db = db or SessionLocal()
    try:
        framework = (
            db.query(models.Framework)
            .filter(models.Framework.name == FRAMEWORK_CODE)
            .first()
        )
        if framework is None:
            framework = models.Framework(
                name=FRAMEWORK_CODE,
                version=FRAMEWORK_VERSION,
                description=FRAMEWORK_DESCRIPTION,
            )
            db.add(framework)
        else:
            framework.version = FRAMEWORK_VERSION
            framework.description = FRAMEWORK_DESCRIPTION
        db.flush()

        for criterion_data in UDA_CRITERIA_DATA:
            criterion = (
                db.query(models.UdaCriterion)
                .filter(models.UdaCriterion.criterion_code == criterion_data["criterion_code"])
                .first()
            )
            if criterion is None:
                criterion = models.UdaCriterion(
                    framework=FRAMEWORK_CODE,
                    category_code=criterion_data["category_code"],
                    category_name=criterion_data["category_name"],
                    criterion_code=criterion_data["criterion_code"],
                )
                db.add(criterion)

            criterion.criterion_name = _clean_seed_text(
                criterion_data["criterion_name"]
            ).lstrip("-â€“ ")
            criterion.objective = _clean_seed_text(criterion_data["objective"])
            criterion.methodology = _clean_seed_text(criterion_data["methodology"])
            criterion.maximum_marks = criterion_data["maximum_marks"]
            criterion.source_page = criterion_data["source_page"]
            if criterion_data["criterion_code"] in UDA_MACHINE_RULES:
                criterion.scoring_status = "defined"
                criterion.automation_type = "numeric_threshold"
                criterion.notes = (
                    "Verified DA scoring bands from the UDA guideline. Original "
                    "condition text is preserved and deterministic machine rules "
                    "are available for preliminary design pre-assessment."
                )
            elif criterion_data["criterion_code"] in UDA_MANUAL_REVIEW_OVERRIDES:
                criterion.scoring_status = "requires_review"
                criterion.automation_type = "manual_review"
                criterion.notes = UDA_MANUAL_REVIEW_OVERRIDES[
                    criterion_data["criterion_code"]
                ]
            else:
                criterion.scoring_status = criterion_data["scoring_status"]
                criterion.automation_type = criterion_data["automation_type"]
                criterion.notes = criterion_data["notes"]
            db.flush()

            existing_rules = {
                rule.rule_order: rule
                for rule in db.query(models.UdaScoringRule)
                .filter(models.UdaScoringRule.criterion_id == criterion.id)
                .all()
            }
            db.query(models.UdaRequiredDocument).filter(
                models.UdaRequiredDocument.criterion_id == criterion.id
            ).delete()
            db.query(models.UdaRecommendationKnowledge).filter(
                models.UdaRecommendationKnowledge.criterion_id == criterion.id
            ).delete()

            machine_rules = UDA_MACHINE_RULES.get(criterion_data["criterion_code"])
            rules_to_seed = machine_rules or criterion_data["rules"]
            desired_rule_orders = set()
            for index, rule_data in enumerate(rules_to_seed, start=1):
                desired_rule_orders.add(index)
                machine_rule = next(
                    (
                        rule
                        for rule in UDA_MACHINE_RULES.get(
                            criterion_data["criterion_code"], []
                        )
                        if rule["rule_order"] == index
                    ),
                    None,
                )
                source_rule = (
                    criterion_data["rules"][index - 1]
                    if index - 1 < len(criterion_data["rules"])
                    else {}
                )
                condition_text = (
                    source_rule.get("condition_text")
                    if machine_rule is None
                    else _machine_condition_text(machine_rule)
                )
                marks = (
                    UDA_MACHINE_RULE_MARKS[criterion_data["criterion_code"]][index - 1]
                    if machine_rule
                    else source_rule.get("marks")
                )
                scoring_rule = existing_rules.get(index)
                if scoring_rule is None:
                    scoring_rule = models.UdaScoringRule(
                        criterion_id=criterion.id,
                        rule_order=index,
                    )
                    db.add(scoring_rule)

                scoring_rule.condition_text = _clean_seed_text(condition_text)
                scoring_rule.marks = marks
                scoring_rule.operator = machine_rule.get("operator") if machine_rule else None
                scoring_rule.threshold_value = (
                    machine_rule.get("threshold_value") if machine_rule else None
                )
                scoring_rule.threshold_unit = (
                    machine_rule.get("threshold_unit") if machine_rule else None
                )
                scoring_rule.machine_rule_json = (
                    json.dumps(machine_rule["machine_rule_json"])
                    if machine_rule
                    else None
                )
                scoring_rule.requires_manual_review = machine_rule is None

            for rule_order, scoring_rule in existing_rules.items():
                if rule_order in desired_rule_orders:
                    continue
                has_assessment = (
                    db.query(models.UdaProjectAssessment)
                    .filter(
                        models.UdaProjectAssessment.selected_rule_id
                        == scoring_rule.id
                    )
                    .first()
                    is not None
                )
                if has_assessment:
                    scoring_rule.requires_manual_review = True
                    scoring_rule.machine_rule_json = None
                    scoring_rule.condition_text = (
                        f"Deprecated seed rule retained for historical assessment "
                        f"traceability: {scoring_rule.condition_text}"
                    )
                else:
                    db.delete(scoring_rule)

            for index, requirement_text in enumerate(criterion_data["da_documents"], start=1):
                db.add(
                    models.UdaRequiredDocument(
                        criterion_id=criterion.id,
                        assessment_stage="DA",
                        requirement_order=index,
                        requirement_text=_clean_seed_text(requirement_text),
                    )
                )

            recommendation_data = UDA_RECOMMENDATION_KNOWLEDGE.get(
                criterion_data["criterion_code"]
            )
            if recommendation_data is None:
                recommendation_data = {
                    "recommendation_text": (
                        "Review the UDA criterion methodology and provide the "
                        "required Design Assessment evidence for assessor "
                        "verification."
                    ),
                    "recommendation_type": "manual_review",
                    "cost_level": "unknown",
                    "implementation_difficulty": "unknown",
                }
            da_documents = [
                _clean_seed_text(document)
                for document in criterion_data["da_documents"]
            ]
            db.add(
                models.UdaRecommendationKnowledge(
                    criterion_id=criterion.id,
                    recommendation_text=recommendation_data["recommendation_text"],
                    recommendation_type=recommendation_data["recommendation_type"],
                    potential_marks_gain=criterion.maximum_marks,
                    cost_level=recommendation_data["cost_level"],
                    implementation_difficulty=recommendation_data[
                        "implementation_difficulty"
                    ],
                    required_documents=json.dumps(da_documents),
                    source_basis=_clean_seed_text(criterion_data["methodology"]),
                    requires_manual_review=(
                        criterion_data["criterion_code"]
                        not in UDA_RECOMMENDATION_KNOWLEDGE
                    ),
                    notes=(
                        "Qualitative cost and difficulty levels are heuristic "
                        "research-prototype placeholders and must be validated "
                        "with industry experts before operational use."
                    ),
                )
            )

            for index, requirement_text in enumerate(criterion_data["cva_documents"], start=1):
                db.add(
                    models.UdaRequiredDocument(
                        criterion_id=criterion.id,
                        assessment_stage="CVA",
                        requirement_order=index,
                        requirement_text=_clean_seed_text(requirement_text),
                    )
                )

        db.commit()
        return {"framework": FRAMEWORK_CODE, "criteria_seeded": len(UDA_CRITERIA_DATA)}
    finally:
        if owns_session:
            db.close()


if __name__ == "__main__":
    result = seed_uda_data()
    print(f"Seeded {result['criteria_seeded']} UDA Blue Green criteria records.")

