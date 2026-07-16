import { ImageResponse } from 'next/og';
import { getRoleById } from '@/lib/roles';
import { getRoleGuide } from '@/lib/role-guide';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = getRoleById(id);
  const guide = getRoleGuide(id);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#EAF4FF', padding: 68, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', background: '#fff', border: '4px solid #B8D8FF', borderRadius: 30, padding: 58 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#1861A8', fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 58, height: 58, borderRadius: 29, background: '#0182FD', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>職</div>
          職涯闖關島
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ color: '#18233A', fontSize: 66, fontWeight: 800 }}>{`${role?.name ?? '實習職位'}實習怎麼準備`}</div>
          <div style={{ color: '#5A6880', fontSize: 34 }}>{guide?.tagline ?? '把準備工作拆成下一個能完成的行動'}</div>
        </div>
        <div style={{ color: '#0182FD', fontSize: 27, fontWeight: 700 }}>職位圖鑑・能力證據・實習機會・7 天計畫</div>
      </div>
    </div>,
    size,
  );
}
