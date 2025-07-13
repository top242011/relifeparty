// src/app/admin/loading.tsx

/**
 * This component will be automatically rendered by Next.js as a fallback UI
 * while the content of a route segment is loading.
 * It applies to all pages under the /admin directory.
 */
export default function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
