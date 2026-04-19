export function NeuralBrain() {
  return (
    <div className="neural-brain" aria-hidden="true">
      <svg viewBox="0 0 520 420" fill="none">
        <defs>
          <linearGradient id="brainStroke" x1="90" y1="70" x2="420" y2="340">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="brainStrokeBack" x1="120" y1="90" x2="420" y2="340">
            <stop offset="0%" stopColor="#0f3a5a" />
            <stop offset="100%" stopColor="#164e7a" />
          </linearGradient>
          <linearGradient id="brainFill" x1="140" y1="80" x2="390" y2="330">
            <stop offset="0%" stopColor="rgba(125, 211, 252, 0.18)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.04)" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="45%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="brainShadow" x="-30%" y="-30%" width="170%" height="190%">
            <feOffset dx="0" dy="18" />
            <feGaussianBlur stdDeviation="18" result="shadow" />
            <feColorMatrix
              in="shadow"
              type="matrix"
              values="0 0 0 0 0.02 0 0 0 0 0.18 0 0 0 0 0.28 0 0 0 0.42 0"
            />
          </filter>
        </defs>

        <g className="brain-depth" transform="translate(16 16)" filter="url(#brainShadow)">
          <path
            className="brain-outline-back"
            d="M170 84C141 88 120 109 116 139C89 146 70 173 70 205C70 236 86 257 110 268C112 309 145 338 187 338H332C377 338 412 304 412 262V257C434 245 450 223 450 194C450 162 430 136 401 128C395 89 362 63 322 68C305 50 281 40 255 40C220 40 190 56 170 84Z"
          />
          <g className="brain-connections-back">
            <path d="M152 142L203 112L248 146L301 124L355 154" />
            <path d="M133 192L187 176L238 202L291 186L349 214" />
            <path d="M148 244L199 226L252 252L312 238L368 264" />
            <path d="M187 112L187 176L199 226L212 294" />
            <path d="M248 146L238 202L252 252L258 308" />
            <path d="M301 124L291 186L312 238L319 298" />
            <path d="M355 154L349 214L368 264L347 312" />
          </g>
          <g className="brain-nodes-back">
            <circle cx="152" cy="142" r="7" />
            <circle cx="203" cy="112" r="8" />
            <circle cx="248" cy="146" r="7" />
            <circle cx="301" cy="124" r="8" />
            <circle cx="355" cy="154" r="7" />
            <circle cx="187" cy="176" r="7" />
            <circle cx="238" cy="202" r="8" />
            <circle cx="291" cy="186" r="7" />
            <circle cx="349" cy="214" r="7" />
            <circle cx="199" cy="226" r="7" />
            <circle cx="252" cy="252" r="8" />
            <circle cx="312" cy="238" r="7" />
            <circle cx="368" cy="264" r="7" />
            <circle cx="258" cy="308" r="8" />
          </g>
        </g>

        <path
          className="brain-fill"
          d="M170 84C141 88 120 109 116 139C89 146 70 173 70 205C70 236 86 257 110 268C112 309 145 338 187 338H332C377 338 412 304 412 262V257C434 245 450 223 450 194C450 162 430 136 401 128C395 89 362 63 322 68C305 50 281 40 255 40C220 40 190 56 170 84Z"
        />

        <path
          className="brain-outline"
          d="M170 84C141 88 120 109 116 139C89 146 70 173 70 205C70 236 86 257 110 268C112 309 145 338 187 338H332C377 338 412 304 412 262V257C434 245 450 223 450 194C450 162 430 136 401 128C395 89 362 63 322 68C305 50 281 40 255 40C220 40 190 56 170 84Z"
          pathLength="1"
        />

        <g className="brain-connections">
          <path d="M152 142L203 112L248 146L301 124L355 154" />
          <path d="M133 192L187 176L238 202L291 186L349 214" />
          <path d="M148 244L199 226L252 252L312 238L368 264" />
          <path d="M187 112L187 176L199 226L212 294" />
          <path d="M248 146L238 202L252 252L258 308" />
          <path d="M301 124L291 186L312 238L319 298" />
          <path d="M355 154L349 214L368 264L347 312" />
          <path d="M203 112L301 124" />
          <path d="M187 176L291 186" />
          <path d="M199 226L312 238" />
          <path d="M252 252L368 264" />
        </g>

        <g className="brain-pulses">
          <path d="M152 142L203 112L248 146L301 124L355 154" pathLength="1" />
          <path d="M133 192L187 176L238 202L291 186L349 214" pathLength="1" />
          <path d="M148 244L199 226L252 252L312 238L368 264" pathLength="1" />
          <path d="M187 112L187 176L199 226L212 294" pathLength="1" />
          <path d="M301 124L291 186L312 238L319 298" pathLength="1" />
        </g>

        <g className="brain-nodes">
          <circle cx="152" cy="142" r="7" />
          <circle cx="203" cy="112" r="8" />
          <circle cx="248" cy="146" r="7" />
          <circle cx="301" cy="124" r="8" />
          <circle cx="355" cy="154" r="7" />
          <circle cx="133" cy="192" r="6" />
          <circle cx="187" cy="176" r="7" />
          <circle cx="238" cy="202" r="8" />
          <circle cx="291" cy="186" r="7" />
          <circle cx="349" cy="214" r="7" />
          <circle cx="148" cy="244" r="6" />
          <circle cx="199" cy="226" r="7" />
          <circle cx="252" cy="252" r="8" />
          <circle cx="312" cy="238" r="7" />
          <circle cx="368" cy="264" r="7" />
          <circle cx="212" cy="294" r="7" />
          <circle cx="258" cy="308" r="8" />
          <circle cx="319" cy="298" r="7" />
          <circle cx="347" cy="312" r="6" />
        </g>

        <g className="brain-active-nodes" filter="url(#softGlow)">
          <circle cx="203" cy="112" r="12" fill="url(#nodeGlow)" />
          <circle cx="291" cy="186" r="14" fill="url(#nodeGlow)" />
          <circle cx="252" cy="252" r="14" fill="url(#nodeGlow)" />
          <circle cx="347" cy="312" r="12" fill="url(#nodeGlow)" />
        </g>
      </svg>
    </div>
  );
}
