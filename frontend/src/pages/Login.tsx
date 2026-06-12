import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell, NeonInput } from "../components/auth/AuthShell.js";
import { Button } from "../components/ui/button.js";
import { apiClient } from "../lib/apiClient.js";
import { toast } from "sonner";
import { auth as clientAuth, googleProvider, isFirebaseInitialized } from "../lib/firebase.js";
import { signInWithPopup } from "firebase/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<any>("/api/auth/login", { email, password });
      if (response.status === "success" && response.data) {
        apiClient.setSession(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );
        toast.success("Welcome back to PayBridge!");
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      let idToken = "";

      if (isFirebaseInitialized && clientAuth && googleProvider) {
        // Real Google Pop-up Auth
        const result = await signInWithPopup(clientAuth, googleProvider);
        idToken = await result.user.getIdToken();
      } else {
        // Fallback Mock Google Login when Firebase Client SDK is not initialized
        const mockEmail = prompt("Firebase Client not configured. Enter mock email to test Google login:") || "google-mock-user@acme.com";
        idToken = `mock-google-token-${mockEmail}`;
      }

      const response = await apiClient.post<any>("/api/auth/google", { idToken });
      if (response.status === "success" && response.data) {
        apiClient.setSession(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );
        toast.success("Welcome! Signed in with Google.");
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Google Sign-In failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" sub="Sign in to your PayBridge workspace.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <NeonInput 
          label="Email" 
          type="email" 
          placeholder="you@company.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <NeonInput 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-between text-xs text-foreground/60">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#00E5FF]" /> Remember me
          </label>
          <a href="#" className="hover:text-[#00E5FF]">Forgot password?</a>
        </div>
        <Button 
          type="submit" 
          className="w-full rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold h-11 glow-cyan"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <div className="relative my-4 text-center text-xs text-foreground/40">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
          <span className="relative bg-[#050816] px-3">or continue with</span>
        </div>
        <Button 
          type="button" 
          onClick={handleGoogleSignIn} 
          variant="outline" 
          className="w-full rounded-xl glass border-white/10 hover:bg-white/5 h-11" 
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.4-.2-2H12v3.8h6c-.3 1.4-1 2.5-2.1 3.3v2.7h3.4c2-1.8 3.2-4.6 3.2-7.8z"/>
            <path fill="#34A853" d="M12 23c2.9 0 5.3-1 7-2.6l-3.4-2.7c-1 .6-2.2 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.5v2.8C4.2 20.4 7.8 23 12 23z"/>
            <path fill="#FBBC04" d="M6 14.3c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H2.5C1.7 9 1.3 10.5 1.3 12s.4 3 1.2 4.5L6 14.3z"/>
            <path fill="#EA4335" d="M12 5.6c1.6 0 3 .5 4.1 1.6l3-3C17.3 2.5 14.9 1.5 12 1.5 7.8 1.5 4.2 4 2.5 7.5L6 10.3c.9-2.5 3.2-4.7 6-4.7z"/>
          </svg>
          Google
        </Button>
        <p className="text-center text-xs text-foreground/50">
          New to PayBridge? <Link to="/register" className="text-[#00E5FF] hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Login;
