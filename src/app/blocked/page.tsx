export default function Blocked() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 max-w-md mx-auto">
      <h1 className="text-4xl font-bold pb-4">Access Restricted</h1>
      <p className="text-lg text-muted-foreground text-center">
        Sorry, this airdrop is not available in your region.
      </p>
    </div>
  );
}
