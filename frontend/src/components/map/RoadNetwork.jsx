import React from 'react';

/**
 * Realistic Lightweight SVG Road Network & City Map
 * Features multi-lane avenues, dashed lane dividers, secondary streets,
 * city building blocks with bevels, green parks with trees, and water canal.
 */
const RoadNetwork = ({ isDarkMode = false }) => {
  // Theme color palettes
  const theme = isDarkMode
    ? {
        bg: '#0f172a', // Slate 900
        block: '#1e293b', // Slate 800
        blockBorder: '#334155',
        roadMain: '#334155', // Slate 700
        roadSecondary: '#1e293b',
        roadLine: '#64748b',
        roadDash: '#94a3b8',
        park: '#064e3b', // Emerald 900
        parkTree: '#047857',
        water: '#0c4a6e', // Sky 900
        label: '#94a3b8',
      }
    : {
        bg: '#f8fafc', // Slate 50
        block: '#ffffff',
        blockBorder: '#e2e8f0',
        roadMain: '#e2e8f0', // Light slate
        roadSecondary: '#f1f5f9',
        roadLine: '#cbd5e1',
        roadDash: '#ffffff',
        park: '#ecfdf5', // Soft emerald green
        parkTree: '#10b981',
        water: '#e0f2fe', // Soft cyan
        label: '#64748b',
      };

  return (
    <g className="road-network pointer-events-none select-none">
      {/* City Background Canvas */}
      <rect width="700" height="850" fill={theme.bg} />

      {/* 1. GREEN PARKS & BOTANICAL GARDENS */}
      {/* Central Park */}
      <rect x="30" y="240" width="130" height="180" rx="16" fill={theme.park} stroke={theme.parkTree} strokeWidth="1" />
      <circle cx="65" cy="280" r="14" fill={theme.parkTree} fillOpacity="0.4" />
      <circle cx="105" cy="310" r="18" fill={theme.parkTree} fillOpacity="0.35" />
      <circle cx="75" cy="370" r="16" fill={theme.parkTree} fillOpacity="0.4" />
      <text x="55" y="340" fill={theme.label} fontSize="10" fontWeight="bold" opacity="0.7">
        Cubbon Park
      </text>

      {/* East Tech Park Green Lawn */}
      <rect x="520" y="80" width="150" height="120" rx="16" fill={theme.park} stroke={theme.parkTree} strokeWidth="1" />
      <circle cx="560" cy="120" r="15" fill={theme.parkTree} fillOpacity="0.35" />
      <circle cx="620" cy="150" r="20" fill={theme.parkTree} fillOpacity="0.3" />
      <text x="560" y="145" fill={theme.label} fontSize="10" fontWeight="bold" opacity="0.7">
        Green Square
      </text>

      {/* South Community Garden */}
      <rect x="60" y="660" width="140" height="130" rx="14" fill={theme.park} stroke={theme.parkTree} strokeWidth="1" />
      <circle cx="110" cy="710" r="18" fill={theme.parkTree} fillOpacity="0.35" />
      <text x="80" y="735" fill={theme.label} fontSize="10" fontWeight="bold" opacity="0.7">
        South Greens
      </text>

      {/* 2. WATER CANAL / LAKE */}
      <path
        d="M 640 450 Q 570 480 580 570 Q 590 660 660 700 L 700 700 L 700 450 Z"
        fill={theme.water}
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <text x="605" y="590" fill="#0284c7" fontSize="10" fontWeight="bold" opacity="0.8">
        Lake View
      </text>

      {/* 3. CITY BUILDING BLOCKS */}
      {/* North Blocks */}
      <rect x="30" y="30" width="90" height="60" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="180" y="20" width="130" height="45" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="340" y="25" width="150" height="50" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />

      {/* Central Commercial Blocks */}
      <rect x="190" y="140" width="70" height="90" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="420" y="150" width="80" height="110" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="200" y="280" width="120" height="100" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="220" y="430" width="140" height="120" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />

      {/* Tech Park Towers */}
      <rect x="420" y="440" width="90" height="110" rx="10" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1.2" />
      <rect x="580" y="250" width="85" height="140" rx="10" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1.2" />

      {/* South Blocks */}
      <rect x="240" y="610" width="140" height="90" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="490" y="600" width="110" height="100" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="260" y="730" width="130" height="80" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />
      <rect x="520" y="730" width="120" height="80" rx="8" fill={theme.block} stroke={theme.blockBorder} strokeWidth="1" />

      {/* 4. SECONDARY STREETS (Lanes) */}
      <g stroke={theme.roadSecondary} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        <line x1="0" y1="120" x2="700" y2="120" />
        <line x1="0" y1="260" x2="700" y2="260" />
        <line x1="0" y1="410" x2="700" y2="410" />
        <line x1="0" y1="580" x2="700" y2="580" />
        <line x1="0" y1="720" x2="700" y2="720" />
        <line x1="160" y1="0" x2="160" y2="850" />
        <line x1="370" y1="0" x2="370" y2="850" />
        <line x1="530" y1="0" x2="530" y2="850" />
      </g>

      {/* 5. MAIN ARTERIAL HIGHWAYS (Multi-lane Avenues with central dividers) */}
      {/* Diagonal Expressway Corridor */}
      <path
        d="M 60 70 Q 250 90 320 180 Q 400 280 430 400 Q 460 520 500 620 Q 540 720 620 810"
        stroke={theme.roadMain}
        strokeWidth="38"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dashed Center Lane */}
      <path
        d="M 60 70 Q 250 90 320 180 Q 400 280 430 400 Q 460 520 500 620 Q 540 720 620 810"
        stroke={theme.roadDash}
        strokeWidth="2"
        strokeDasharray="10 8"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* West-East Ring Road Highway */}
      <path
        d="M 0 350 Q 200 330 350 360 Q 500 390 700 350"
        stroke={theme.roadMain}
        strokeWidth="36"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 0 350 Q 200 330 350 360 Q 500 390 700 350"
        stroke={theme.roadDash}
        strokeWidth="2"
        strokeDasharray="10 8"
        fill="none"
        opacity="0.8"
      />

      {/* North-South Ring Road Highway */}
      <path
        d="M 280 0 Q 300 250 290 480 Q 280 650 310 850"
        stroke={theme.roadMain}
        strokeWidth="32"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 280 0 Q 300 250 290 480 Q 280 650 310 850"
        stroke={theme.roadDash}
        strokeWidth="2"
        strokeDasharray="10 8"
        fill="none"
        opacity="0.8"
      />

      {/* 6. ZEBRA CROSSINGS AT INTERSECTIONS */}
      <g stroke={theme.roadDash} strokeWidth="2.5" opacity="0.75">
        <line x1="145" y1="114" x2="145" y2="126" strokeDasharray="3 3" />
        <line x1="355" y1="254" x2="355" y2="266" strokeDasharray="3 3" />
        <line x1="515" y1="404" x2="515" y2="416" strokeDasharray="3 3" />
        <line x1="415" y1="574" x2="415" y2="586" strokeDasharray="3 3" />
      </g>

      {/* 7. STREET NAMES & LANDMARKS */}
      <text x="65" y="113" fill={theme.label} fontSize="9" fontWeight="700" opacity="0.65">
        100ft Road
      </text>
      <text x="390" y="343" fill={theme.label} fontSize="9" fontWeight="700" opacity="0.65">
        Outer Ring Road
      </text>
      <text x="180" y="573" fill={theme.label} fontSize="9" fontWeight="700" opacity="0.65">
        Residency Road
      </text>
      <text x="445" y="515" fill={theme.label} fontSize="8" fontWeight="700" opacity="0.65">
        Tech Corridor
      </text>
      <text x="210" y="713" fill={theme.label} fontSize="9" fontWeight="700" opacity="0.65">
        MG Road
      </text>
    </g>
  );
};

export default RoadNetwork;
