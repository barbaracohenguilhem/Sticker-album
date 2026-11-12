const BLOCKS = [
  [120, 185, 135, 85, -12], [135, 345, 125, 85, -12],
  [320, 280, 140, 70, -12], [520, 235, 100, 95, -12],
  [640, 160, 100, 95, -12], [575, 425, 110, 75, -12],
  [715, 460, 145, 85, -12], [470, 620, 110, 70, -12],
  [490, 800, 150, 70, -12], [175, 715, 105, 80, -12],
  [75, 550, 105, 95, -12], [785, 750, 120, 85, -12],
];
const TREES = [
  [300, 165], [327, 158], [355, 154], [470, 115], [480, 145], [505, 128],
  [567, 350], [590, 345], [615, 339], [815, 350], [849, 365], [865, 338],
  [520, 470], [545, 485], [520, 510], [550, 522],
  [252, 625], [272, 660], [228, 655], [405, 830], [430, 850],
  [650, 775], [680, 793], [710, 784], [920, 570], [940, 595],
  [90, 260], [110, 283], [870, 130], [899, 145],
];

export function NeighborhoodScene() {
  return (
    <svg className="neighborhood-art" viewBox="-1000 -1000 3000 3000" aria-hidden="true">
      <defs>
        <pattern id="grass-grain" width="37" height="31" patternUnits="userSpaceOnUse">
          <path d="m8 9 2-3m0 3 2-2 M27 25l2-3" stroke="#78b891" strokeWidth="1" opacity=".35" />
        </pattern>
        <pattern id="water-lines" width="45" height="30" patternUnits="userSpaceOnUse">
          <path d="M5 10h14m8 14h10" stroke="#e5f6ef" strokeWidth="2" opacity=".45" />
        </pattern>
      </defs>
      <path fill="#acd4ad" d="M-1000-1000h3000v3000h-3000z" />
      <path fill="url(#grass-grain)" d="M-1000-1000h3000v3000h-3000z" />
      <path d="M-1200 1150Q-450 1200-80 760C110 540 280 890 430 660S730 545 730 375 940 350 1060 160 1450-300 2200-150" fill="none" stroke="#83baa5" strokeWidth="112" />
      <path d="M-1200 1150Q-450 1200-80 760C110 540 280 890 430 660S730 545 730 375 940 350 1060 160 1450-300 2200-150" fill="none" stroke="#72bfc5" strokeWidth="82" />
      <path d="M-1200 1150Q-450 1200-80 760C110 540 280 890 430 660S730 545 730 375 940 350 1060 160 1450-300 2200-150" fill="none" stroke="url(#water-lines)" strokeWidth="80" />
      <g fill="#99c79a" stroke="#90bd90" strokeWidth="2">
        <path d="m325 390 133-28 65 200-149 37-81-68Z" />
        <path d="m285 70 259-55 23 129-261 55Z" />
        <path d="m748 596 189-45 35 124-189 45Z" />
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#92b8a0" strokeWidth="39">
          <path d="M-1200 575 2200-143 M-1200 768 2200 50 M-1200 971 2200 254 M-1200 1211 2200 494" />
          <path d="M-32-1200 772 2200 M208-1200 1012 2200 M488-1200 1292 2200 M-251-1200 491 2200" />
        </g>
        <g stroke="#ecebd1" strokeWidth="30">
          <path d="M-1200 575 2200-143 M-1200 768 2200 50 M-1200 971 2200 254 M-1200 1211 2200 494" />
          <path d="M-32-1200 772 2200 M208-1200 1012 2200 M488-1200 1292 2200 M-251-1200 491 2200" />
        </g>
        <g stroke="#faf6df" strokeWidth="2" strokeDasharray="10 15">
          <path d="M-1200 768 2200 50 M-1200 1211 2200 494" />
          <path d="M208-1200 1012 2200" />
        </g>
        <path d="m340 435 105-22 40 123-75 16" stroke="#d7ddbb" strokeWidth="9" />
      </g>
      {BLOCKS.map(([x, y, width, height, rotation], index) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotation})`}>
          <rect x="5" y="7" width={width} height={height} rx="9" fill="#699b84" opacity=".23" />
          <rect width={width} height={height} rx="8" fill={index % 3 === 0 ? "#d3d9b9" : "#bfcea9"} />
          <rect x="10" y="9" width={width * .42} height={height - 22} rx="3" fill={index % 3 === 0 ? "#f1d2ac" : "#dfddc4"} stroke="#a7b699" strokeWidth="2" />
          <rect x={width * .57} y="9" width={width * .33} height={height * .48} rx="3" fill={index % 2 === 0 ? "#c5c8b5" : "#e8c5a6"} stroke="#a7b699" strokeWidth="2" />
          <path d={`m15 17 ${width * .31} 0 M${width * .61} 17h${width * .22}`} stroke="#fff5dc" strokeWidth="3" opacity=".8" />
        </g>
      ))}
      <g transform="translate(500 552)">
        <ellipse cy="6" rx="52" ry="40" fill="#769f84" opacity=".25" />
        <ellipse rx="52" ry="40" fill="#e3dfc5" stroke="#d1ceb5" strokeWidth="3" />
        <ellipse rx="29" ry="23" fill="#a9c7ba" stroke="#f8f2da" strokeWidth="7" />
        <ellipse rx="20" ry="14" fill="#78bfc3" />
        <path d="M0-18v16" stroke="#eff8e9" strokeWidth="5" strokeLinecap="round" />
      </g>
      {TREES.map(([x, y], index) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <ellipse cx="5" cy="9" rx="13" ry="7" fill="#568968" opacity=".25" />
          <path d="M0 0v13" stroke="#668465" strokeWidth="4" />
          <ellipse cy="-6" rx={index % 2 ? 12 : 15} ry="18" fill={index % 3 === 0 ? "#559574" : "#6ca67b"} />
          <path d="M-5-17q-6 8-3 13" stroke="#8cba89" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <g className="map-street-names" fill="#52766a" fontSize="12" fontWeight="600" letterSpacing="2">
        <text transform="translate(190 475) rotate(-12)">RUA DAS DESCOBERTAS</text>
        <text transform="translate(585 724) rotate(-12)">ALAMEDA DO ENCONTRO</text>
        <text x="359" y="485" fontSize="10" letterSpacing="1">JARDIM</text>
        <text x="345" y="501" fontSize="10" letterSpacing="1">DOS ACHADOS</text>
      </g>
      <g fill="#f7f1dd" stroke="#a6b7a0" strokeWidth="2" transform="translate(645 615) rotate(-12)">
        <path d="M0 0h68v24H0z" />
        <path d="M9 0v24m10-24v24m10-24v24m10-24v24m10-24v24m10-24v24" />
      </g>
    </svg>
  );
}
