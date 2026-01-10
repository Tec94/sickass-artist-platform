import '../styles/conflict-modal.css'

interface ConflictModalProps {
  item: {
    id: string
    type: string
    payload: Record<string, unknown>
    serverVersion?: unknown
    localVersion?: unknown
  }
  onResolve: (choice: 'server' | 'local') => void
}

export const ConflictModal = ({ item, onResolve }: ConflictModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal conflict-modal">
        <h2>Changes conflict detected</h2>
        <p>This item was modified elsewhere. Which version would you like to keep?</p>

        <div className="version-comparison">
          <div className="version server">
            <h3>Server Version (Latest)</h3>
            <div className="version-content">
              <pre>{JSON.stringify(item.serverVersion || item.payload, null, 2)}</pre>
              <p className="version-info">Updated from another device</p>
            </div>
            <button onClick={() => onResolve('server')} className="button button-primary">
              Use this version
            </button>
          </div>

          <div className="divider">VS</div>

          <div className="version local">
            <h3>Your Changes</h3>
            <div className="version-content">
              <pre>{JSON.stringify(item.localVersion || item.payload, null, 2)}</pre>
              <p className="version-info">Your local changes</p>
            </div>
            <button onClick={() => onResolve('local')} className="button button-secondary">
              Keep my changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
