import fs from 'fs';
import path from 'path';

const prototypeDir = path.join(process.cwd(), 'src', 'pages', 'StitchPrototypes');
if (!fs.existsSync(prototypeDir)) {
  fs.mkdirSync(prototypeDir, { recursive: true });
}

const screens = [
  'Archive', 'Rankings', 'Identity', 'Community', 'Journey',
  'StoreBoutique', 'Salon', 'Directory', 'AccessTiers',
  'AccessTiersAlbert', 'Experience', 'ExperienceAlbert',
  'EventsMobile', 'EventsExhibitions', 'DashboardLight'
];

let indexContent = '';

screens.forEach(screen => {
  const content = `import { Link } from 'react-router-dom';
import { setNextTransition } from '../../components/Effects/PageTransition';

export default function ${screen}() {
  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#3C2A21] p-8">
      <h1 className="text-4xl font-serif mb-4">${screen} Screen</h1>
      <p className="font-sans">Fetching content from Stitch...</p>
      
      <div className="mt-8 flex gap-4">
        <Link 
          to="/proto/directory" 
          onClick={() => setNextTransition('push-back')}
          className="border border-[#3C2A21] px-4 py-2 hover:bg-[#3C2A21] hover:text-[#F4EFE6] transition-colors"
        >
          Back to Directory
        </Link>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(prototypeDir, `${screen}.tsx`), content);
  indexContent += `export { default as ${screen} } from './${screen}';\n`;
});

fs.writeFileSync(path.join(prototypeDir, 'index.ts'), indexContent);
console.log('Generated prototype files.');
