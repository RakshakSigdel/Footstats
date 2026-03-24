export default function TournamentTopPlayersTab({ topPlayers, onPlayerClick, onClubClick }) {
  return (
    <section className="app-card p-6">
      <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Top Players</h2>
      <p className="mt-1 text-sm text-surface-600">Tournament-specific leaderboard by goals and assists.</p>
      {topPlayers.length === 0 ? (
        <p className="mt-3 text-sm text-surface-600">No player stats available yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="table-premium w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b-2 border-surface-200 text-left text-xs uppercase tracking-wide text-surface-500">
                <th className="py-3 pr-4">Player</th>
                <th className="py-3 pr-4">Club</th>
                <th className="py-3 pr-4">Goals</th>
                <th className="py-3">Assists</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((player) => (
                <tr
                  key={`${player.userId}-${player.clubId}`}
                  className="border-b border-surface-100 hover:bg-primary-50/30 transition-colors"
                >
                  <td className="py-3 pr-4 font-semibold text-gray-900">
                    <button
                      type="button"
                      onClick={() => onPlayerClick(player.userId)}
                      className="text-left text-primary-700 hover:text-primary-800 hover:underline"
                    >
                      {player.firstName} {player.lastName}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-surface-600">
                    <button
                      type="button"
                      onClick={() => onClubClick(player.clubId)}
                      className="text-left text-primary-700 hover:text-primary-800 hover:underline"
                    >
                      {player.clubName || `Club ${player.clubId}`}
                    </button>
                  </td>
                  <td className="py-3 pr-4 font-bold text-gray-900">{player.goals}</td>
                  <td className="py-3 font-bold text-gray-900">{player.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
