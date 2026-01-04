import { useParams } from 'react-router-dom'

export const ContentPage = () => {
  const { gear } = useParams<{ gear: string }>()

  const getGearTitle = (gear: string): string => {
    const titles: Record<string, string> = {
      R: 'Reverse Gear',
      N: 'Neutral',
      '1': 'Events',
      '2': 'Merch',
      '3': 'Gallery',
      '4': 'Forum',
      '5': 'Chatroom',
    }
    return titles[gear] || 'Unknown Gear'
  }

  const getGearDescription = (gear: string): string => {
    const descriptions: Record<string, string> = {
      R: 'Going back in style',
      N: 'Taking a pause',
      '1': 'Upcoming shows and gatherings',
      '2': 'Exclusive limited items',
      '3': 'Visual journey',
      '4': 'Community discussions',
      '5': 'Connect with others',
    }
    return descriptions[gear] || ''
  }

  return (
    <div className="content-page">
      <div className="content-placeholder">
        <h1 className="gear-title">
          <span className="gear-badge">{gear}</span>
          {getGearTitle(gear || 'N')}
        </h1>
        <p className="gear-description">{getGearDescription(gear || 'N')}</p>
        <div className="content-area">
          <p>Content will be added in future chats...</p>
          <p className="hint-text">
            Use the gear navigation (top on mobile, left on desktop) or press R/N/1-5 keys
          </p>
        </div>
      </div>

      <style>{`
        .content-page {
          min-height: 400px;
        }

        .content-placeholder {
          text-align: center;
          padding: 40px 20px;
        }

        .gear-title {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 32px;
          color: #00D9FF;
          margin: 0 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .gear-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba(0, 217, 255, 0.2);
          border: 2px solid #00D9FF;
          border-radius: 50%;
          font-size: 28px;
          font-weight: bold;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
        }

        .gear-description {
          font-size: 18px;
          color: #E0E0E0;
          margin: 0 0 32px 0;
          font-style: italic;
        }

        .content-area {
          padding: 24px;
          background: rgba(28, 31, 46, 0.5);
          border: 1px solid rgba(139, 15, 255, 0.3);
          border-radius: 8px;
        }

        .content-area p {
          margin: 0 0 16px 0;
          color: #E0E0E0;
          font-size: 16px;
          line-height: 1.6;
        }

        .hint-text {
          color: #8B0FFF;
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 767px) {
          .gear-title {
            font-size: 24px;
            flex-direction: column;
            gap: 8px;
          }

          .gear-badge {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .gear-description {
            font-size: 16px;
          }

          .content-area {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}
