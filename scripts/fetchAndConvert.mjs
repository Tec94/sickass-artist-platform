import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.join(process.cwd(), 'src', 'pages', 'StitchPrototypes');
const rawDataPath = 'C:\\\\Users\\\\caoda\\\\.gemini\\\\antigravity\\\\brain\\\\84ed3cad-2083-4e47-b5a4-7e097ac9f41b\\\\.system_generated\\\\steps\\\\125\\\\output.txt';

const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

// Filter out markdown logic and excluded dashboards
const excludedKeywords = [
  '.md', 'Roadmap', 'PRD', 'Untitled',
  'Refined Dark Mode', 'Dashboard (Refined)', 'Refined Mobile V2'
];

const alreadyBuilt = [
  'Directory', 'Archive', 'Community'
];

const screenFilesList = [];

for (const screen of rawData.screens) {
  if (!screen.htmlCode || !screen.htmlCode.downloadUrl) continue;
  if (excludedKeywords.some(kw => screen.title.includes(kw))) continue;
  
  // Mapping titles to file names exactly how they are in our App.tsx
  let fileName = '';
  if (screen.title.includes('Global Quest System')) fileName = 'Journey';
  else if (screen.title.includes('Boutique')) fileName = 'StoreBoutique';
  else if (screen.title === 'Access Tiers (Mobile Light)') fileName = 'AccessTiers';
  else if (screen.title.includes('Identity')) fileName = 'Identity';
  else if (screen.title === 'Estate Dashboard (Light Mobile Final)') fileName = 'DashboardLight';
  else if (screen.title.includes('Access Tiers: Royal Albert Hall')) fileName = 'AccessTiersAlbert';
  else if (screen.title.includes('Rankings')) fileName = 'Rankings';
  else if (screen.title.includes('Events (Exhibitions)')) fileName = 'EventsExhibitions';
  else if (screen.title === 'The Experience: Royal Albert Hall (Updated)') fileName = 'ExperienceAlbert';
  else if (screen.title === 'The Experience (Mobile Light)') fileName = 'Experience';
  else if (screen.title === 'The Events (Mobile Light)') fileName = 'EventsMobile';
  else if (screen.title.includes('The Salon')) fileName = 'Salon';
  else continue; // skip unmapped ones
  
  if (alreadyBuilt.includes(fileName)) continue;

  screenFilesList.push({
    fileName,
    url: screen.htmlCode.downloadUrl
  });
}

// Ensure the 3 original ones we built get their styles too if we run them.
// Actually we shouldn't overwrite Directory, Archive, and Community because we already refactored them manually!
// They are excluded in alreadyBuilt. That's perfect.

const lucideIconMap = {
  'search': 'Search',
  'menu': 'Menu',
  'close': 'X',
  'arrow_back': 'ArrowLeft',
  'arrow_forward': 'ArrowRight',
  'arrow_downward': 'ArrowDown',
  'arrow_upward': 'ArrowUp',
  'chevron_left': 'ChevronLeft',
  'chevron_right': 'ChevronRight',
  'person': 'User',
  'account_circle': 'UserCircle',
  'shopping_bag': 'ShoppingBag',
  'shopping_cart': 'ShoppingCart',
  'leaderboard': 'Trophy',
  'menu_book': 'BookOpen',
  'history_edu': 'Scroll',
  'ink_pen': 'PenTool', // Approx
  'push_pin': 'Pin',
  'trending_up': 'TrendingUp',
  'trending_down': 'TrendingDown',
  'trending_flat': 'Minus',
  'home': 'Home',
  'dashboard': 'LayoutDashboard',
  'event': 'Calendar',
  'star': 'Star',
  'settings': 'Settings',
  'music_note': 'Music',
  'play_arrow': 'Play',
  'pause': 'Pause',
  'skip_next': 'SkipForward',
  'skip_previous': 'SkipBack',
  'more_vert': 'MoreVertical',
  'more_horiz': 'MoreHorizontal',
  'filter_list': 'ListFilter',
  'sort': 'ArrowUpDown',
  'local_activity': 'Ticket',
  'confirmation_number': 'Ticket',
  'store': 'Store',
  'forum': 'MessageSquare',
  'chat': 'MessageCircle',
  'logout': 'LogOut',
  'mail': 'Mail',
  'notifications': 'Bell',
  'favorite': 'Heart'
};

async function transformHtmlToJsx(html, fileName) {
  // Extract style tag from head if it exists
  let styleContent = '';
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    styleContent = `<style>{\`${styleMatch[1].replace(/`/g, '\\`')}\`}</style>`;
  }

  // Rough JSX transforms
  let jsx = html.replace(/<!DOCTYPE html>.*?(<body)/si, '$1'); // Extract from body down
  jsx = jsx.replace(/<\/body>[\s\S]*<\/html>/i, ''); // Remove body close
  
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  jsx = jsx.replace(/tabindex=/g, 'tabIndex=');
  
  // self close img, input, hr, br safely
  ['img', 'input', 'hr', 'br'].forEach(tag => {
    const regex = new RegExp(`<${tag}(.*?)\\/?>`, 'g');
    jsx = jsx.replace(regex, (m, p1) => {
      let props = p1;
      if (props.endsWith('/')) {
        props = props.slice(0, -1);
      }
      return `<${tag}${props} />`;
    });
  });
  
  // Replace inline styles with empty strings or objects (naive clear of most simple ones)
  jsx = jsx.replace(/style="[^"]*"/g, '');
  jsx = jsx.replace(/style='[^']*'/g, '');

  const usedIcons = new Set();
  
  // Replace google icons with lucide
  jsx = jsx.replace(/<span[^>]*material-symbols-outlined[^>]*>([^<]+)<\/span>/g, (match, iconName) => {
    const cleanName = iconName.trim();
    const lucideName = lucideIconMap[cleanName] || 'Circle'; // fallback
    usedIcons.add(lucideName);
    const classNameMatch = match.match(/className="([^"]+)"/);
    let classes = classNameMatch ? classNameMatch[1].replace('material-symbols-outlined', '').trim() : '';
    return `<${lucideName} ${classes ? `className="${classes}" ` : ''}/>`;
  });
  
  // Replace button containing icon
  jsx = jsx.replace(/<button[^>]*material-symbols-outlined[^>]*>([^<]+)<\/button>/g, (match, iconName) => {
    const cleanName = iconName.trim();
    const lucideName = lucideIconMap[cleanName] || 'Circle';
    usedIcons.add(lucideName);
    const classNameMatch = match.match(/className="([^"]+)"/);
    let classes = classNameMatch ? classNameMatch[1].replace('material-symbols-outlined', '').trim() : '';
    return `<button ${classes ? `className="${classes}" ` : ''}><${lucideName} /></button>`;
  });

  const imports = [];
  imports.push(`import { Link } from 'react-router-dom';`);
  imports.push(`import { setNextTransition } from '../../components/Effects/PageTransition';`);
  if (usedIcons.size > 0) {
    imports.push(`import { ${Array.from(usedIcons).join(', ')} } from 'lucide-react';`);
  }

  // Wrap href="#" to Link
  jsx = jsx.replace(/<a([^>]*)href="#"([^>]*)>/g, '<Link$1to="/proto/directory"$2>');
  jsx = jsx.replace(/<\/a>/g, '</Link>');

  jsx = jsx.replace(/<body[^>]*>/, '').replace(/<\/body>/, ''); // remove body tags

  // Ensure content works in react (no raw text inside JSX without tags unless valid)
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments entirely
  const finalCode = `${imports.join('\n')}

export default function ${fileName}() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] w-full font-sans">
      ${styleContent}
      ${jsx}
    </div>
  );
}`;

  return finalCode;
}

async function run() {
  console.log('Downloading and converting ', screenFilesList.length, ' files...');
  for (const s of screenFilesList) {
    console.log('Downloading ' + s.fileName);
    const content = await new Promise((resolve, reject) => {
      https.get(s.url, resp => {
        let text = '';
        resp.on('data', chunk => text += chunk);
        resp.on('end', () => resolve(text));
      }).on('error', reject);
    });

    const jsx = await transformHtmlToJsx(content, s.fileName);
    fs.writeFileSync(path.join(outDir, `${s.fileName}.tsx`), jsx);
    console.log('Saved ' + s.fileName);
  }
}

run().catch(console.error);
