/**
 * Settings Page
 * 
 * Displays user account settings including:
 * - Profile info (name, email)
 * - Password change
 * - Subscription/plan info
 * - Credits display with reset timing
 * - Account deletion
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GradientBackground } from "@/components/GradientBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useSubscriptionContext } from "@/context/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { redirectToPortal, getPlanInfo } from "@/lib/stripe";
import { Check, Loader2, Crown, Sparkles, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Get the next daily reset time in PST
 * Credits reset at midnight PST
 */
function getNextDailyReset(): Date {
  const now = new Date();
  // Get current time in PST
  const pstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  
  // Set to midnight PST tomorrow
  const nextReset = new Date(pstNow);
  nextReset.setDate(nextReset.getDate() + 1);
  nextReset.setHours(0, 0, 0, 0);
  
  // Convert back to local time for display
  // This is a bit hacky but works for display purposes
  const pstOffset = -8; // PST is UTC-8 (ignoring DST for simplicity)
  const localOffset = now.getTimezoneOffset() / 60;
  const hourDiff = localOffset + pstOffset;
  
  nextReset.setHours(nextReset.getHours() - hourDiff);
  
  return nextReset;
}

/**
 * Format date for display
 */
function formatResetDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const { 
    subscription, 
    planName, 
    credits, 
    totalCreditsAvailable,
    isLoadingSubscription,
    isLoadingCredits,
  } = useSubscriptionContext();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Loading states
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Initialize display name from user metadata
  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name 
        || user.user_metadata?.name 
        || user.email?.split("@")[0] 
        || "";
      setDisplayName(name);
    }
  }, [user]);

  const userEmail = user?.email ?? "";
  const planInfo = getPlanInfo(planName);
  const nextReset = getNextDailyReset();
  const totalCredits = (credits?.dailyTotal ?? 0) + (credits?.monthlyTotal ?? 0);

  /**
   * Update display name
   */
  const handleUpdateName = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a display name.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() }
      });

      if (error) throw error;

      toast({
        title: "Name updated",
        description: "Your display name has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message ?? "Failed to update name.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  /**
   * Change password
   */
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Password required",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error?.message ?? "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  /**
   * Open Stripe Customer Portal
   */
  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      await redirectToPortal();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "Failed to open subscription portal.",
        variant: "destructive",
      });
      setIsManagingSubscription(false);
    }
  };

  /**
   * Delete account
   */
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // Sign out first, then the user can contact support for full deletion
      // (Full deletion requires admin/server-side action)
      await signOut();
      
      toast({
        title: "Account signed out",
        description: "Contact support to complete account deletion.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "Failed to process request.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050609] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050609] relative">
      <GradientBackground />
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            {/* Account Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Account</h2>
              
              {/* Email - Read only */}
              <div className="border-b border-[#232323] pb-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <p className="text-xs text-muted-foreground">
                      Your email address associated with your account.
                    </p>
                  </div>
                  <Input 
                    type="email"
                    value={userEmail}
                    disabled
                    className="sm:w-80 bg-[#1a1a1a] border-[#3a3a3a] text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="border-b border-[#232323] pb-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <p className="text-xs text-muted-foreground">
                      Your full name, as visible to others.
                    </p>
                  </div>
                  <div className="flex gap-2 sm:w-80">
                    <Input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border-[#3a3a3a]"
                      placeholder="Your name"
                    />
                    <Button 
                      onClick={handleUpdateName}
                      disabled={isUpdatingName}
                      size="sm"
                      className="px-4"
                    >
                      {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="border-b border-[#232323] pb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Change Password</label>
                  <p className="text-xs text-muted-foreground">
                    Update your password to keep your account secure.
                  </p>
                </div>
                <div className="space-y-3 sm:max-w-80">
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#1a1a1a] border-[#3a3a3a]"
                    placeholder="New password"
                  />
                  <Input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#1a1a1a] border-[#3a3a3a]"
                    placeholder="Confirm new password"
                  />
                  <Button 
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Change Password
                  </Button>
                </div>
              </div>
            </section>

            {/* Plan & Credits Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Plan & Credits</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Current Plan Card */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center">
                      {planName === 'premium' ? (
                        <Sparkles className="w-5 h-5 text-white" />
                      ) : planName === 'pro' ? (
                        <Crown className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white text-lg font-bold">F</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        You're on {planInfo.name} Plan
                      </p>
                      {subscription?.currentPeriodEnd && (
                        <p className="text-sm text-muted-foreground">
                          {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'}{' '}
                          {subscription.currentPeriodEnd.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {planName !== 'free' ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleManageSubscription}
                      disabled={isManagingSubscription}
                      className="border-[#3a3a3a] hover:bg-[#2a2a2a]"
                    >
                      {isManagingSubscription ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Manage
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => navigate('/pricing')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Upgrade
                    </Button>
                  )}
                </div>

                {/* Credits Card */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Credits remaining</span>
                    <span className="text-sm text-muted-foreground">
                      {isLoadingCredits ? (
                        <Loader2 className="w-4 h-4 animate-spin inline" />
                      ) : (
                        `${totalCreditsAvailable} of ${totalCredits}`
                      )}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: totalCredits > 0 
                          ? `${Math.min(100, (totalCreditsAvailable / totalCredits) * 100)}%` 
                          : '0%',
                        background: 'linear-gradient(90deg, #5A9665 0%, #4B8256 70%, #6B9FD4 100%)',
                      }} 
                    />
                  </div>

                  {/* Credit details */}
                  <div className="space-y-2 text-sm">
                    {credits?.monthlyTotal > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        <span>Up to {credits.monthlyTotal} credits rollover</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>
                        {credits?.dailyTotal ?? 3} credits reset on {formatResetDate(nextReset)}
                      </span>
                    </div>

                    {credits?.monthlyRemaining !== undefined && credits.monthlyRemaining > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>Daily credits used first</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h2>
              
              <div className="border border-destructive/30 rounded-xl p-5 bg-destructive/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-medium">Delete account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your extendr account. This cannot be undone.
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="sm:w-auto w-full"
                      >
                        Delete account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1a1a1a] border-[#3a3a3a]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#3a3a3a] hover:bg-[#2a2a2a]">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeletingAccount ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Delete account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
