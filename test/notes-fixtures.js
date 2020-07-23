const makeNotesArray = () => {
	return [
		{
			id: 1,
			note_name: 'ABC',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eget faucibus nulla. Cras egestas fringilla massa at mollis. Donec hendrerit.',
			folder_id: 1,
			modified: '2020-01-22T16:28:32.615Z',
		},
		{
			id: 2,
			note_name: 'DEF',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eget faucibus nulla. Cras egestas fringilla massa at mollis. Donec hendrerit.',
			folder_id: 1,
			modified: '2020-01-22T16:28:32.615Z',
		},
		{
			id: 3,
			note_name: 'GHI',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eget faucibus nulla. Cras egestas fringilla massa at mollis. Donec hendrerit.',
			folder_id: 2,
			modified: '2020-01-22T16:28:32.615Z',
		},
		{
			id: 4,
			note_name: 'JKL',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eget faucibus nulla. Cras egestas fringilla massa at mollis. Donec hendrerit.',
			folder_id: 2,
			modified: '2020-01-22T16:28:32.615Z',
		},
		{
			id: 5,
			note_name: 'MNO',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eget faucibus nulla. Cras egestas fringilla massa at mollis. Donec hendrerit.',
			folder_id: 3,
			modified: '2020-01-22T16:28:32.615Z',
		},
		{
			id: 6,
			note_name: 'PQR',
			content:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eget faucibus nulla. Cras egestas fringilla massa at mollis. Donec hendrerit.',
			folder_id: 4,
			modified: '2020-01-22T16:28:32.615Z',
		},
	]
}
const makeBadNote = () => {
	const badNote = {
		note_name: 'PQR',
		content:
			'Bad <img src="http://whocares.com" onerror="alert(document.cookie);">',
		folder_id: 1,
		modified: '2020-01-22T16:28:32.615Z',
	}
	const expectedNote = {
		...badNote,
		content: `Bad <img src="http://whocares.com">`,
	}
	return {
		badNote,
		expectedNote,
	}
}
module.exports = { makeNotesArray, makeBadNote }
