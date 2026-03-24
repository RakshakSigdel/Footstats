import ClubListCard from "../../../components/Club/ClubListCard";

export default function TournamentClubsTab({ acceptedRegistrations, isTournamentAdmin, onClubClick }) {
  return (
    <section className="app-card p-6">
      <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Joined Clubs</h2>
      {acceptedRegistrations.length === 0 ? (
        <p className="mt-3 text-sm text-surface-600">No clubs have been approved yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {acceptedRegistrations.map((r) => (
            <ClubListCard
              key={r.registrationId}
              club={{
                ...r.club,
                foundedDate: r.club?.foundedDate,
              }}
              showRole={false}
              showFounded={false}
              onClick={() => onClubClick(r.clubId)}
              metaLines={[
                ...(isTournamentAdmin ? [{ label: "Payment", value: r.paymentStatus || "PENDING" }] : []),
                ...(r.notes ? [{ label: "Note", value: r.notes }] : []),
              ]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
