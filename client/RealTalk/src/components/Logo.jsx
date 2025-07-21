function Logo({ size = 80, color = "#25D366" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cercle de fond */}
      <circle cx="50" cy="50" r="45" fill={color} stroke="#fff" strokeWidth="2"/>
      
      {/* Bulle de chat principale */}
      <path d="M25 35 C25 28, 30 23, 37 23 L63 23 C70 23, 75 28, 75 35 L75 50 C75 57, 70 62, 63 62 L45 62 L35 70 L35 62 C28 62, 25 57, 25 50 Z" 
            fill="white" 
            stroke="none"/>
      
      {/* Points de conversation */}
      <circle cx="40" cy="40" r="3" fill={color}/>
      <circle cx="50" cy="40" r="3" fill={color}/>
      <circle cx="60" cy="40" r="3" fill={color}/>
      
      {/* Petite bulle secondaire */}
      <circle cx="70" cy="30" r="8" fill="white" stroke={color} strokeWidth="1.5"/>
      <circle cx="68" cy="28" r="1.5" fill={color}/>
      <circle cx="72" cy="32" r="1.5" fill={color}/>
      
      {/* Texte RT (RealTalk) */}
      <text x="50" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">RT</text>
    </svg>
  );
}

export default Logo;