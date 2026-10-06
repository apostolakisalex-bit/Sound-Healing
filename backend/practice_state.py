"""Derived assessment state; preserves stored practice review decisions."""
async def decorate_practices(db, practices):
    ids = [p['id'] for p in practices]
    answered = {a['practice_id'] async for a in db.assessment_answers.find({'practice_id': {'$in': ids}, 'status': 'submitted'}, {'practice_id': 1})}
    received = {a['practice_id'] async for a in db.assessment_invitations.find({'practice_id': {'$in': ids}, 'status': 'submitted'}, {'practice_id': 1})}
    labels = {'draft': 'Πρόχειρη', 'submitted': 'Προς έλεγχο', 'changes_requested': 'Χρειάζεται διόρθωση', 'reviewed': 'Εγκρίθηκε'}
    for p in practices:
        p['practitioner_submitted'] = p['id'] in answered
        p['receiver_submitted'] = p['id'] in received
        p['display_status'] = 'awaiting_evaluation' if p['status'] == 'submitted' and (p['id'] not in answered or p['id'] not in received) else p['status']
        p['status_label'] = 'Αναμονή αξιολόγησης' if p['display_status'] == 'awaiting_evaluation' else labels.get(p['status'], p['status'])
    return practices
