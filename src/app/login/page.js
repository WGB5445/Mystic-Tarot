'use client'

// pages/my-page.jsx
import dynamic from 'next/dynamic';

// 使用动态导入并禁用SSR
const NoSSRComponent = dynamic(() => import('../../../components/Keyless'), {
  ssr: false,
});

export default function MyPage() {
  return (
    <div>
      <NoSSRComponent />
    </div>
  );
}