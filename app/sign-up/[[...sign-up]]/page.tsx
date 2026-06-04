import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[#9de9f4] px-4 py-10 text-[#0f3a64]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(185,245,41,0.32),transparent_24%),linear-gradient(180deg,#c9f7ff_0%,#f7fcff_52%,#fff8ed_100%)]" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_30px_100px_rgba(15,58,100,0.16)] backdrop-blur-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/70 bg-white/75 text-3xl shadow-[0_18px_60px_rgba(15,58,100,0.12)]">
            🌍
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-[#0f3a64]">
            เริ่มต้นวางแผนทริปของคุณ
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#0f3a64]/65">
            สมัครใช้งานเพื่อบันทึกแผนเที่ยวและดูทริปทั้งหมดของคุณ
          </p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/create-trip"
        />
      </div>
    </main>
  );
}
