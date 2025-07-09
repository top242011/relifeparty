import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow" style={{ width: '24rem' }}>
        <div className="card-body p-5">
          <h3 className="card-title text-center mb-4">Relife Party Admin</h3>
          {/* ส่ง action ไปยังฟังก์ชัน login ที่เราสร้าง */}
          <form action={login}>
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="form-control" />
            </div>
            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="form-control" />
            </div>
            {/* ส่วนแสดงข้อความ Error จาก URL */}
            {searchParams.message && (
              <div className="alert alert-danger p-2" role="alert">
                {searchParams.message}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-100">
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}