import React from 'react'

// Inline SVG icon components sourced from @elastic/eui SVG assets.
// euiIcon__fillSecondary → #0B64DD (accent-blue)
// euiIcon__fillNegative  → none / transparent

export function AgentIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fill="currentColor" d="M2.99581 18.6363L0 20.4337V26.5661L6 30.1661L11 27.1661L16 30.1661L21 27.1661L26 30.1661L32 26.5661V20.4337L27 17.4337V12.4337L22 9.43374V4.43374L16 0.83374L10 4.43374V7.26581L12 7.29946V5.56612L16 3.16612L20 5.56612V9.43374L18.0041 10.6313L19.0042 12.3636L21 11.1661L25 13.5661V17.4337L21 19.8337L18.7433 18.4797L17.772 20.2293L20 21.5661V25.4337L16 27.8337L12 25.4337V23.7342L10 23.7006V25.4337L6 27.8337L2 25.4337L2 21.5661L3.99595 20.3686L2.99581 18.6363ZM22 25.4337V21.5661L26 19.1661L30 21.5661V25.4337L26 27.8337L22 25.4337Z" />
      <path fill="#0B64DD" d="M11 22.1662L5 18.5662L5 12.4338L11 8.83382L17 12.4338L17 18.5662L11 22.1662ZM15 17.4338L15 13.5662L11 11.1662L7 13.5662L7 17.4338L11 19.8338L15 17.4338Z" />
    </svg>
  )
}

export function FleetIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fill="#0B64DD" d="M21 2.81994L16 0.0383301L11 2.81991V5.10857L16 2.32699L21 5.1086V2.81994Z" />
      <path fill="#0B64DD" d="M21 7.28161L16 4.5L11 7.28158V9.57024L16 6.78866L21 9.57027V7.28161Z" />
      <path fill="currentColor" d="M7 5.04535L2 7.82695V23.4039L16 31.1923L30 23.4039V7.82695L25 5.04536V7.33402L28 9.00297V22.2278L16 28.9037L4 22.2279V9.00297L7 7.33401V5.04535Z" />
      <path fill="#0B64DD" fillRule="evenodd" clipRule="evenodd" d="M22 12.5L16 9L10 12.5V19.5L16 23L22 19.5V12.5ZM12.026 13.7053L16 11.3871L19.974 13.7053V18.2947L16 20.6129L12.026 18.2947V13.7053Z" />
    </svg>
  )
}

export function LogstashIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(3)">
        <polygon fill="#3EBEB0" points="16 32 27 32 27 20 16 20" />
        <path fill="#FEC514" d="M1,0 L0,0 L0,20 L13,20 L13,12 C13,5.373 7.627,0 1,0" />
        <path fill="none" d="M0,20 L0,20 C0,26.627 5.373,32 12,32 L13,32 L13,20 L0,20 Z" />
      </g>
    </svg>
  )
}

export function BeatsIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(4)">
        <path fill="#0080D5" d="M11,20 L0,20 L0,0 L11,0 C16.522,0 21,4.478 21,10 C21,15.522 16.522,20 11,20" />
        <path fill="#00C2B3" d="M22.7021,15.624 C20.6001,19.979 16.1521,23 11.0001,23 L0.0001,23 L0.0001,32 L15.0001,32 C20.5221,32 25.0001,27.522 25.0001,22 C25.0001,19.576 24.1371,17.354 22.7021,15.624" />
        <path fill="none" d="M20.3379,13.5537 C18.7919,12.5747 16.9649,11.9997 14.9999,11.9997 L-0.0001,11.9997 L-0.0001,19.9997 L10.9999,19.9997 C15.2699,19.9997 18.9029,17.3197 20.3379,13.5537" />
      </g>
    </svg>
  )
}

export function KibanaIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g fill="none" fillRule="evenodd" transform="translate(4)">
        <polygon fill="#F04E98" points="0 0 0 28.789 24.935 .017" />
        <path fill="#E8D4DF" d="M0,12 L0,28.789 L11.906,15.051 C8.368,13.115 4.317,12 0,12" />
        <path fill="#00BFB3" d="M14.4785,16.664 L2.2675,30.754 L1.1945,31.991 L24.3865,31.991 C23.1345,25.699 19.5035,20.272 14.4785,16.664" />
      </g>
    </svg>
  )
}

export function ElasticsearchIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g fill="none" fillRule="evenodd" transform="translate(2)">
        <path fill="#E8D4C2" d="M0,16 C0,17.384 0.194,18.72 0.524,20 L20,20 C22.209,20 24,18.209 24,16 C24,13.791 22.209,12 20,12 L0.524,12 C0.194,13.28 0,14.616 0,16" />
        <path fill="#FEC514" d="M26.9238,7.6621 C27.4828,7.1461 28.0028,6.5931 28.4798,6.0001 C25.5468,2.3461 21.0498,0.0001 15.9998,0.0001 C9.6788,0.0001 4.2388,3.6781 1.6438,9.0001 L23.5108,9.0001 C24.7768,9.0001 25.9938,8.5191 26.9238,7.6621" />
        <path fill="#00BFB3" d="M23.5107,23 L1.6437,23 C4.2397,28.323 9.6787,32 15.9997,32 C21.0497,32 25.5467,29.654 28.4797,26 C28.0027,25.407 27.4827,24.854 26.9237,24.338 C25.9937,23.48 24.7767,23 23.5107,23" />
      </g>
    </svg>
  )
}

export function MLIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(1)">
        <polygon fill="currentColor" points="16 18 16 16 14 16 14 18 2 18 2 24 4 24 4 20 14 20 14 24 16 24 16 20 26 20 26 24 28 24 28 18" />
        <path fill="#0B64DD" d="M3 32C1.343 32 0 30.657 0 29 0 27.343 1.343 26 3 26 4.657 26 6 27.343 6 29 6 30.657 4.657 32 3 32ZM3 28C2.448 28 2 28.448 2 29 2 29.552 2.448 30 3 30 3.552 30 4 29.552 4 29 4 28.448 3.552 28 3 28ZM15 32C13.343 32 12 30.657 12 29 12 27.343 13.343 26 15 26 16.657 26 18 27.343 18 29 18 30.657 16.657 32 15 32ZM15 28C14.448 28 14 28.448 14 29 14 29.552 14.448 30 15 30 15.552 30 16 29.552 16 29 16 28.448 15.552 28 15 28ZM27 32C25.343 32 24 30.657 24 29 24 27.343 25.343 26 27 26 28.657 26 30 27.343 30 29 30 30.657 28.657 32 27 32ZM27 28C26.448 28 26 28.448 26 29 26 29.552 26.448 30 27 30 27.552 30 28 29.552 28 29 28 28.448 27.552 28 27 28ZM22 8L22 6 19.9 6C19.771 5.375 19.523 4.781 19.17 4.25L20.66 2.76 19.24 1.34 17.75 2.83C17.219 2.477 16.625 2.229 16 2.1L16 0 14 0 14 2.1C13.375 2.229 12.781 2.477 12.25 2.83L10.76 1.34 9.34 2.76 10.83 4.25C10.477 4.781 10.229 5.375 10.1 6L8 6 8 8 10.1 8C10.229 8.625 10.477 9.219 10.83 9.75L9.34 11.24 10.75 12.65 12.24 11.16C12.774 11.517 13.371 11.769 14 11.9L14 14 16 14 16 11.9C16.625 11.771 17.219 11.523 17.75 11.17L19.24 12.66 20.65 11.25 19.17 9.75C19.523 9.219 19.771 8.625 19.9 8L22 8ZM15 10C13.343 10 12 8.657 12 7 12 5.343 13.343 4 15 4 16.657 4 18 5.343 18 7 18 7.796 17.684 8.559 17.121 9.121 16.559 9.684 15.796 10 15 10Z" />
        <path fill="currentColor" d="M15,8 C14.448,8 14,7.552 14,7 C14,6.934 14,6.867 14,6.8 C14.011,6.737 14.031,6.677 14.06,6.62 C14.082,6.556 14.112,6.496 14.15,6.44 C14.187,6.388 14.227,6.338 14.27,6.29 C14.364,6.197 14.476,6.126 14.6,6.08 C14.972,5.923 15.402,6.006 15.69,6.29 L15.81,6.44 C15.848,6.496 15.878,6.556 15.9,6.62 C15.943,6.674 15.977,6.735 16,6.8 C16.005,6.867 16.005,6.933 16,7 C16,7.552 15.552,8 15,8 Z" />
      </g>
    </svg>
  )
}

export function SecurityAnalyticsIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fill="currentColor" d="M3 10h4v2H5v7.928c0 1.299.808 2.795 2.88 4.48 1.83 1.489 4.524 3.02 8.12 4.584V26h2v5.992l-1.38-.567c-4.372-1.797-7.724-3.613-10-5.465C4.358 24.122 3 22.114 3 19.928V10z" />
      <path fill="#0B64DD" d="M9 10h9v14l-1.272-.458c-1.367-.494-3.23-1.314-4.768-2.39C10.484 20.118 9 18.636 9 16.761V10zm1.895 1.876v4.887c0 .877.744 1.867 2.158 2.856.937.656 2.038 1.219 3.052 1.657v-9.4h-5.21z" />
      <path fill="currentColor" d="M29 1H9v7h2V2.966h16V16.73c0 .558-.245 1.128-.756 1.72-.515.596-1.256 1.158-2.12 1.668-1.381.818-2.961 1.434-4.124 1.817V24c1.26-.378 3.334-1.12 5.155-2.197.965-.57 1.905-1.261 2.612-2.08.712-.822 1.233-1.827 1.233-2.992V1z" />
    </svg>
  )
}

export function CloudIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g fill="none" fillRule="evenodd" transform="translate(2)">
        <path fill="none" d="M10.3691,18.3525 C10.4021,18.3415 10.4361,18.3385 10.4701,18.3295 C10.1671,17.6135 10.0001,16.8265 10.0001,15.9995 C10.0001,12.6865 12.6861,9.9995 16.0001,9.9995 L16.0001,-0.0005 C7.1631,-0.0005 0.0001,7.1635 0.0001,15.9995 C0.0001,18.7925 0.7191,21.4155 1.9761,23.7015 C4.2571,21.2015 7.1381,19.3545 10.3691,18.3525" />
        <path fill="#0080D5" d="M16,0 C11.063,0 6.651,2.236 3.717,5.75 C5.669,8.088 8.277,9.858 11.258,10.782 C11.968,11.002 12.735,10.917 13.404,10.594 C14.189,10.214 15.069,10 16,10 C16.931,10 17.811,10.214 18.596,10.594 C19.265,10.917 20.032,11.002 20.742,10.782 C23.723,9.858 26.33,8.088 28.283,5.75 C25.349,2.236 20.937,0 16,0" />
        <path fill="#00BFB3" d="M20.7422,21.2178 C20.0322,20.9978 19.2642,21.0828 18.5962,21.4058 C17.8102,21.7858 16.9302,21.9998 16.0002,21.9998 C15.0692,21.9998 14.1892,21.7858 13.4042,21.4058 C12.7352,21.0828 11.9682,20.9978 11.2582,21.2178 C8.2772,22.1418 5.6692,23.9118 3.7172,26.2498 C6.6512,29.7638 11.0632,31.9998 16.0002,31.9998 C20.9362,31.9998 25.3482,29.7638 28.2832,26.2498 C26.3302,23.9118 23.7222,22.1418 20.7422,21.2178" />
      </g>
    </svg>
  )
}

export function ECKIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g fill="none" fillRule="evenodd" transform="translate(2)">
        <path fill="none" d="M18.0001,-0.0005 L18.0001,9.9995 C14.6861,9.9995 12.0001,12.6865 12.0001,15.9995 C12.0001,16.8265 12.1671,17.6135 12.4701,18.3295 C12.4361,18.3385 12.4021,18.3415 12.3691,18.3525 C9.1381,19.3545 6.2571,21.2015 3.9761,23.7015 C2.7191,21.4155 2.0001,18.7925 2.0001,15.9995 C2.0001,7.1635 9.1631,-0.0005 18.0001,-0.0005 Z" />
        <path fill="#00AEFA" d="M22.7422,21.2178 C22.0322,20.9978 21.2642,21.0828 20.5962,21.4058 C19.8102,21.7858 18.9302,21.9998 18.0002,21.9998 C17.0692,21.9998 16.1892,21.7858 15.4042,21.4058 C14.7352,21.0828 13.9682,20.9978 13.2582,21.2178 C10.2772,22.1418 7.6692,23.9118 5.7172,26.2498 C8.6512,29.7638 13.0632,31.9998 18.0002,31.9998 C22.9362,31.9998 27.3482,29.7638 30.2832,26.2498 C28.3302,23.9118 25.7222,22.1418 22.7422,21.2178" />
        <path fill="#0080D5" d="M18,0 C13.063,0 8.651,2.236 5.717,5.75 C7.669,8.088 10.277,9.858 13.258,10.782 C13.968,11.002 14.735,10.917 15.404,10.594 C16.189,10.214 17.069,10 18,10 C18.931,10 19.811,10.214 20.596,10.594 C21.265,10.917 22.032,11.002 22.742,10.782 C25.723,9.858 28.33,8.088 30.283,5.75 C27.349,2.236 22.937,0 18,0" />
      </g>
    </svg>
  )
}

export function ILMIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g transform="translate(1)">
        <polygon fill="currentColor" points="16 18 16 16 14 16 14 18 2 18 2 24 4 24 4 20 14 20 14 24 16 24 16 20 26 20 26 24 28 24 28 18" />
        <circle fill="#0B64DD" cx="3" cy="29" r="3" />
        <circle fill="#0B64DD" cx="15" cy="29" r="3" />
        <circle fill="#0B64DD" cx="27" cy="29" r="3" />
        <path fill="currentColor" d="M15,8 C13.343,8 12,6.657 12,5 C12,3.343 13.343,2 15,2 C16.657,2 18,3.343 18,5 C18,6.657 16.657,8 15,8Z" />
        <path fill="currentColor" d="M22,8L22 6 19.9 6C19.771 5.375 19.523 4.781 19.17 4.25L20.66 2.76 19.24 1.34 17.75 2.83C17.219 2.477 16.625 2.229 16 2.1L16 0 14 0 14 2.1C13.375 2.229 12.781 2.477 12.25 2.83L10.76 1.34 9.34 2.76 10.83 4.25C10.477 4.781 10.229 5.375 10.1 6L8 6 8 8 10.1 8C10.229 8.625 10.477 9.219 10.83 9.75L9.34 11.24 10.75 12.65 12.24 11.16C12.774 11.517 13.371 11.769 14 11.9L14 14 16 14 16 11.9C16.625 11.771 17.219 11.523 17.75 11.17L19.24 12.66 20.65 11.25 19.17 9.75C19.523 9.219 19.771 8.625 19.9 8L22 8Z" />
      </g>
    </svg>
  )
}

export function CCRIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g>
        <path fill="currentColor" d="M0 0L0 16 8.7 16 14 10 14 0 0 0zM2 2L12 2 12 9 7 9 7 14 2 14 2 2zM10.45 11L9 12.64 9 11 10.45 11zM18 16L18 32 26.7 32 32 26 32 16 18 16zM20 18L30 18 30 25 25 25 25 30 20 30 20 18zM28.45 27L27 28.64 27 27 28.45 27z" />
        <path fill="#0B64DD" d="M5 18L3 18C3 24.0751322 7.92486775 29 14 29L16 29 16 27 14 27C9.02943725 27 5 22.9705627 5 18zM18 3L16 3 16 5 18 5C22.9705627 5 27 9.02943725 27 14L29 14C29 7.92486775 24.0751322 3 18 3z" />
      </g>
    </svg>
  )
}

export function StackIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fill="#F04E98" d="M0 2.37A2.37 2.37 0 0 1 2.37 0h27.26A2.37 2.37 0 0 1 32 2.37v6.52H0V2.37Z" />
      <path fill="#00BFB3" d="M0 20.148h32v-8.296H0v8.296Z" />
      <path fill="#0077CC" d="M0 23.111h32v6.519A2.37 2.37 0 0 1 29.63 32H2.37A2.37 2.37 0 0 1 0 29.63v-6.52Z" />
    </svg>
  )
}

export function ServerIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="4" width="24" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="14" width="24" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="8.5" cy="17.5" r="1.2" fill="currentColor" />
      <rect x="4" y="24" width="24" height="5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="26.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function NetworkIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="5" cy="26" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="27" cy="26" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="16" y1="8" x2="16" y2="12.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="18" x2="7" y2="23.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="19" y1="18" x2="25" y2="23.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function StorageIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="16" cy="7" rx="11" ry="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 7 L5 25 C5 27.2 10 29 16 29 C22 29 27 27.2 27 25 L27 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 16 C5 18.2 10 20 16 20 C22 20 27 18.2 27 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  )
}

export function SnapshotIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="2" y="8" width="28" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8 L8 4 M16 8 L16 4 M24 8 L24 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 19 L13 22 L16 25 M16 19 L19 22 L16 25" fill="none" stroke="#0B64DD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AlertIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 4 L28 26 L4 26 Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="16" y2="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="23" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function SearchIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="13" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="19.5" y1="19.5" x2="28" y2="28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="9" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="9" x2="13" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function InvestigateIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="5" width="26" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="11" x2="29" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="8" r="1.5" fill="currentColor" />
    </svg>
  )
}
