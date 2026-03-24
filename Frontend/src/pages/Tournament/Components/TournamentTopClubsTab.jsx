export default function TournamentTopClubsTab({ topClubs, onClubClick }) {
  return (
    <section className="app-card p-6">
      <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Top Clubs</h2>
      <p className="mt-1 text-sm text-surface-600">Tournament table generated from completed match scores.</p>
      {topClubs.length === 0 ? (
        <p className="mt-3 text-sm text-surface-600">No club standings available yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="table-premium w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b-2 border-surface-200 text-left text-xs uppercase tracking-wide text-surface-500">
                <th className="py-3 pr-4">Club</th>
                <th className="py-3 pr-4">P</th>
                <th className="py-3 pr-4">W</th>
                <th className="py-3 pr-4">D</th>
                <th className="py-3 pr-4">L</th>
                <th className="py-3 pr-4">GF</th>
                <th className="py-3 pr-4">GA</th>
                <th className="py-3">Pts</th>
              </tr>
            </thead>
            <tbody>
              {topClubs.map((club) => (
                <tr
                  key={club.clubId}
                  onClick={() => onClubClick(club.clubId)}
                  className="border-b border-surface-100 cursor-pointer hover:bg-primary-50/30 transition-colors"
                >
                  <td className="py-3 pr-4 font-semibold text-gray-900">{club.clubName}</td>
                  <td className="py-3 pr-4 text-surface-700">{club.played}</td>
                  <td className="py-3 pr-4 text-surface-700">{club.wins}</td>
                  <td className="py-3 pr-4 text-surface-700">{club.draws}</td>
                  <td className="py-3 pr-4 text-surface-700">{club.losses}</td>
                  <td className="py-3 pr-4 text-surface-700">{club.goalsFor}</td>
                  <td className="py-3 pr-4 text-surface-700">{club.goalsAgainst}</td>
                  <td className="py-3 font-bold text-primary-700">{club.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
