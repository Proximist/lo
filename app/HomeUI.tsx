import Link from 'next/link'

interface HomeUIProps {
  user: any;
  buttonStage1: 'check' | 'claim' | 'claimed';
  buttonStage2: 'check' | 'claim' | 'claimed';
  isLoading: boolean;
  notification: string;
  handleButtonClick1: () => void;
  handleButtonClick2: () => void;
  handleClaim1: () => void;
  handleClaim2: () => void;
}

export default function HomeUI({
  user,
  buttonStage1,
  buttonStage2,
  isLoading,
  notification,
  handleButtonClick1,
  handleButtonClick2,
  handleClaim1,
  handleClaim2
}: HomeUIProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Welcome, {user.firstName}!</h1>
      <div className="text-center mb-4">
        <p className="text-lg">Your current points: {user.points}</p>
      </div>

      {user.invitedBy && (
        <div className="text-center mb-4">
          <p>Invited by: {user.invitedBy}</p>
        </div>
      )}

      {/* Button 1 styling based on the provided layout */}
      <div className="bg-gray-200 w-full p-4 rounded-lg flex justify-between items-center mb-4 glow-pink-on-hover transition duration-300">
        <p className="text-gray-800">Follow Our Youtube!</p>
        <button
          onClick={() => {
            if (buttonStage1 === 'check') {
              handleButtonClick1()
            } else if (buttonStage1 === 'claim') {
              handleClaim1()
            }
          }}
          disabled={buttonStage1 === 'claimed' || isLoading}
          className={`bg-gray-300 text-gray-800 px-4 py-2 rounded-lg ${
            buttonStage1 === 'claimed' || isLoading ? 'cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Claiming...' : buttonStage1 === 'check' ? 'Check' : buttonStage1 === 'claim' ? 'Claim' : 'Claimed'}
        </button>
      </div>

      {/* Button 2 remains the same */}
      <div
        className={`py-2 px-4 rounded mt-4 ${
          buttonStage2 === 'check'
            ? 'bg-green-500 hover:bg-green-700'
            : buttonStage2 === 'claim'
            ? 'bg-orange-500 hover:bg-orange-700'
            : 'bg-lightblue'
        }`}
      >
        <button
          onClick={() => {
            handleButtonClick2()
            handleClaim2()
          }}
          disabled={buttonStage2 === 'claimed'}
          className={`w-full text-white font-bold py-2 rounded ${
            buttonStage2 === 'claimed' ? 'cursor-not-allowed' : ''
          }`}
        >
          {buttonStage2 === 'check' && 'Check'}
          {buttonStage2 === 'claim' && 'Claim'}
          {buttonStage2 === 'claimed' && 'Claimed'}
        </button>
      </div>

      {notification && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {notification}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-blue-500 p-4">
        <Link href="/invite">
          <a className="block text-center text-white font-bold">
            Invite Friends
          </a>
        </Link>
      </nav>
    </div>
  )
}
