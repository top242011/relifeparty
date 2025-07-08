    // app/admin/login/page.tsx
    'use client'; // Client Component เพราะมีการจัดการ State และ Interaction กับผู้ใช้

    import { useState } from 'react';
    import { useRouter } from 'next/navigation';
    import { getSupabaseBrowserClient } from 'utils/supabase/client'; // ใช้ Absolute Path

    export default function LoginPage() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState('');
      const router = useRouter();

      const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        const supabase = getSupabaseBrowserClient();

        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setMessage(error.message);
          } else {
            setMessage('เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนเส้นทาง...');
            router.push('/admin/dashboard'); // เปลี่ยนเส้นทางไปยังหน้า Dashboard หลัง Login
          }
        } catch (err: any) {
          setMessage(`เกิดข้อผิดพลาดที่ไม่คาดคิด: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-gradient-primary-secondary p-4">
          <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="card-body">
              <h2 className="card-title text-center mb-4 text-dark-blue">เข้าสู่ระบบ Admin</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label text-dark-blue">อีเมล</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label text-dark-blue">รหัสผ่าน</label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-dark-blue w-100"
                  disabled={loading}
                >
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </form>
              {message && (
                <div className={`alert mt-3 ${message.includes('สำเร็จ') ? 'alert-success' : 'alert-danger'}`} role="alert">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    