import React, { useState } from 'react';
import { Phone, ChevronRight, X, Search } from './Icons';

const hotlineData = [
    {
        category: "Emergency Hotlines",
        items: [
            { name: "City Disaster Risk Reduction & Management Office", numbers: ["8352-5000", "8292-1405", "0919 009 4045", "0917 881 1639"] },
            { name: "Valenzuela City Fire Station", numbers: ["8292 - 3519"] },
            { name: "Valenzuela City Police Station - Main Station", numbers: ["8352-4000", "0906 419 7676", "0998 598 7868"] },
            { name: "Valenzuela City Emergency Hospital", numbers: ["8352-6000"] },
            { name: "Valenzuela Medical Center", numbers: ["8294-6711"] }
        ]
    },
    {
        category: "Legislative Building (Local Lines)",
        items: [
            { name: "CSWD", numbers: ["1213", "1407", "1105"] },
            { name: "OSCA", numbers: ["2148"] },
            { name: "Senior Citizen", numbers: ["1203"] },
            { name: "Health Office", numbers: ["1107", "1110", "1111", "1104", "1116"] },
            { name: "CESU", numbers: ["2951", "1804"] },
            { name: "HRMO", numbers: ["1121", "1122", "1124"] },
            { name: "Payroll", numbers: ["1128", "1133", "2136"] },
            { name: "CSWD (Other)", numbers: ["1129", "1103"] },
            { name: "Accounting Office", numbers: ["1528", "1512", "1609", "1507", "1508", "1524", "1510"] },
            { name: "Audit Office", numbers: ["1518", "1519"] },
            { name: "Council Secretariat", numbers: ["1402"] },
            { name: "Vice Mayor", numbers: ["1301", "1303"] },
            { name: "Power Room", numbers: ["1323"] },
            { name: "Legal Office", numbers: ["1208", "1206"] },
            { name: "COOP", numbers: ["1815"] },
            { name: "Public Information Office", numbers: ["1132", "1138"] },
            { name: "Legislative", numbers: ["1138"] },
            { name: "Liga ng mga Barangay", numbers: ["1321"] },
            { name: "Conference Room - 3A", numbers: ["1614"] },
            { name: "Conference Room - 3B", numbers: ["1615"] },
            { name: "Conference Room - 3C", numbers: ["2953"] },
            { name: "Session Hall", numbers: ["1319"] }
        ]
    },
    {
        category: "City Council (Local Lines)",
        items: [
            { name: "Councilor Lorie Natividad-Borja", numbers: [] },
            { name: "Councilor Mickey Pineda", numbers: ["1304"] },
            { name: "Councilor Bimbo Dela Cruz", numbers: ["1313"] },
            { name: "Councilor Chiqui Carreon", numbers: ["1320"] },
            { name: "Councilor Kisha Ancheta", numbers: [] },
            { name: "Councilor Richard Enriquez", numbers: ["1540"] },
            { name: "Councilor Sel Sabino-Sy", numbers: ["1312"] },
            { name: "Councilor Goyong Serrano", numbers: [] },
            { name: "Councilor Louie Nolasco", numbers: ["1606"] },
            { name: "Councilor Nina Lopez", numbers: ["1542"] },
            { name: "Councilor Ghogo Deato Lee", numbers: ["1545"] },
            { name: "Councilor Cris Feliciano-Tan", numbers: ["1603"] },
            { name: "Sangguniang Kabataan", numbers: ["1315"] }
        ]
    },
    {
        category: "Trade Center (Local Lines)",
        items: [
            { name: "Cong Rex", numbers: ["2990", "2991", "2992", "2993", "2994", "2995", "2996"] },
            { name: "City Development Office/LEIPO", numbers: ["1806"] },
            { name: "City Livelihood Office", numbers: ["2971"] },
            { name: "City Veteran's Office", numbers: ["1803"] },
            { name: "DILG", numbers: ["2976"] },
            { name: "DTI", numbers: ["2978"] },
            { name: "Job Generation Office", numbers: ["1215", "1829"] },
            { name: "Out of School Youth", numbers: ["2979"] },
            { name: "PLEB", numbers: ["2975"] },
            { name: "PDEA", numbers: ["2980"] },
            { name: "PESO", numbers: ["1710", "1711"] },
            { name: "TAFFGIP", numbers: ["1828", "2972"] },
            { name: "VADAC", numbers: ["2977"] },
            { name: "Workers Affairs Office", numbers: ["2974"] },
            { name: "Youth Development Office", numbers: ["2973"] },
            { name: "Central Barangay Accounting Unit", numbers: ["1137"] }
        ]
    },
    {
        category: "Finance Office (Local Lines)",
        items: [
            { name: "Business Permit and Licensing Office", numbers: ["1515", "1801", "1823", "1927", "1926"] },
            { name: "City Assessor's Office", numbers: ["1302", "1305", "1306", "1307", "1318", "1310", "1350", "1366", "1367", "2500", "1125"] },
            { name: "City Business Inspection and Audit Team", numbers: ["1501"] },
            { name: "City Environment and Natural Resources Office", numbers: ["1212"] },
            { name: "City Treasurer's Office - Admin", numbers: ["1106", "1108", "1109", "1112", "1113", "1114", "1115", "1117", "1120", "1123", "2350"] },
            { name: "City Treasurer's Office - Cash", numbers: ["1314", "1820", "1604", "1131", "1814", "1134", "1929", "1917"] },
            { name: "City Zoning Office", numbers: ["1812", "1811"] },
            { name: "GIS - Data Management Office", numbers: ["2985"] },
            { name: "Information (Reception/Lobby)", numbers: ["1250"] },
            { name: "ICTO - Admin", numbers: ["1700", "1702", "1703", "2650"] },
            { name: "ICTO - Technical", numbers: ["1602", "1704", "1705", "1706"] },
            { name: "Local Civil Registry - Admin/Records", numbers: ["1308", "1400", "1404", "1408", "1409", "1412", "1414", "1818", "1403", "1415", "1522"] },
            { name: "Project Ayos", numbers: ["2108"] },
            { name: "Office of the Building Official", numbers: ["2100", "2110", "2123", "2137"] }
        ]
    },
    {
        category: "Police Offices (Local Lines)",
        items: [
            { name: "Chief of Police", numbers: ["4101"] },
            { name: "D. Copa", numbers: ["4120"] },
            { name: "D. Copo", numbers: ["4115"] },
            { name: "DMU", numbers: ["4110"] },
            { name: "Information", numbers: ["4117"] },
            { name: "Intel", numbers: ["4108"] },
            { name: "Health Clinic", numbers: ["1134"] },
            { name: "COP", numbers: ["1401"] },
            { name: "Operator", numbers: ["4145"] },
            { name: "SOCO", numbers: ["4127"] },
            { name: "Clinic", numbers: ["1610"] },
            { name: "SIU", numbers: ["4107"] },
            { name: "JAIL", numbers: ["4123"] },
            { name: "SPOS", numbers: ["4112"] },
            { name: "Operations", numbers: ["4109"] },
            { name: "Anti Sensing", numbers: ["4111"] },
            { name: "Record", numbers: ["4106"] },
            { name: "Warrants", numbers: ["4121"] },
            { name: "SAID", numbers: ["4130"] },
            { name: "SESPO", numbers: ["4118"] },
            { name: "Supply", numbers: ["4114"] },
            { name: "TOC", numbers: ["4119"] },
            { name: "Traffic", numbers: ["4116"] },
            { name: "Womens", numbers: ["4113"] },
            { name: "TMU - End Work", numbers: ["4110"] },
            { name: "Laboratory", numbers: ["2142"] },
            { name: "Health", numbers: ["2101"] },
            { name: "COP Secretary", numbers: ["4144"] },
            { name: "Finance", numbers: ["4132", "4122"] },
            { name: "PCR", numbers: ["4125"] },
            { name: "Police Clearance", numbers: ["4124"] }
        ]
    },
    {
        category: "Department Heads (Local Lines)",
        items: [
            { name: "ADMIN & RECORDS OFFICE", numbers: ["1216"] },
            { name: "BPLO", numbers: ["1928"] },
            { name: "CITY BUDGET OFFICE", numbers: ["1715"] },
            { name: "CITY ACCOUNTING", numbers: ["1510"] },
            { name: "CITY ASSESSORS OFFICE", numbers: ["1350"] },
            { name: "CITY ENGINEERING", numbers: ["1950 / 1914"] },
            { name: "CITY HEALTH", numbers: ["1111"] },
            { name: "CITY LEGAL OFFICE", numbers: ["1206"] },
            { name: "CITY MAYORS OFFICE", numbers: ["1142 / 1147"] },
            { name: "CITY PLANNING", numbers: ["1135"] },
            { name: "CITY TREASURERS", numbers: ["1106"] },
            { name: "GIS", numbers: ["2985"] },
            { name: "Housing and Ressetlement", numbers: ["2144"] },
            { name: "HRMO", numbers: ["1124"] },
            { name: "ICTO", numbers: ["2650"] },
            { name: "LCR", numbers: ["1504"] },
            { name: "OBO", numbers: ["2110"] },
            { name: "PAYROLL", numbers: ["2136"] },
            { name: "PIO", numbers: ["1132"] },
            { name: "PROCUREMENT OFFICE", numbers: ["1932"] },
            { name: "PROPERTY OFFICE", numbers: ["1332"] },
            { name: "ZONING", numbers: ["1812"] }
        ]
    },
    {
        category: "Other Stations",
        items: [
            { name: "Maysan Health Station", numbers: ["3444-4919"] }
        ]
    }
];

const HotlineSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<string[]>(["Emergency Hotlines"]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const filteredData = hotlineData.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.numbers.some(num => num.includes(searchTerm))
        )
    })).filter(section => section.items.length > 0);

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-blue-600 text-white p-3 rounded-l-xl shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                aria-label="Open Hotline Directory"
            >
                <Phone className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-bold uppercase vertical-text hidden md:block">Hotlines</span>
            </button>

            {/* Sidebar Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        <h2 className="font-bold text-lg">Directory</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search department or number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {filteredData.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-sm">No results found</p>
                        </div>
                    ) : (
                        filteredData.map((section, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                <button
                                    onClick={() => toggleCategory(section.category)}
                                    className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors text-left"
                                >
                                    <span className="font-bold text-sm text-gray-700">{section.category}</span>
                                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedCategories.includes(section.category) ? 'rotate-90' : ''}`} />
                                </button>

                                {expandedCategories.includes(section.category) && (
                                    <div className="divide-y divide-gray-100">
                                        {section.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="p-3 hover:bg-blue-50 transition-colors">
                                                <p className="text-xs font-bold text-gray-800 mb-1">{item.name}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.numbers.length > 0 ? (
                                                        item.numbers.map((num, numIdx) => (
                                                            <a
                                                                key={numIdx}
                                                                href={`tel:${num.replace(/[^0-9+]/g, '')}`}
                                                                className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-[10px] font-mono font-medium rounded border border-green-200 hover:bg-green-100 transition-colors"
                                                            >
                                                                {num}
                                                            </a>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 italic">No direct line</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400">
                        Tap numbers to call directly
                    </p>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default HotlineSidebar;
