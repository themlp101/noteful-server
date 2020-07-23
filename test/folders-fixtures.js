const makeFoldersArray = () => {
	return [
		{
			id: 1,
			folder_name: 'Alphabets',
		},
		{
			id: 2,
			folder_name: 'Llamas',
		},
		{
			id: 3,
			folder_name: 'Runaway Jim',
		},
		{
			id: 4,
			folder_name: 'Character Zero',
		},
		{
			id: 5,
			folder_name: 'Mockingbird',
		},
	]
}

const makeMaliciousFolder = () => {
	const maliciousFolder = {
		id: 999,
		folder_name:
			'Bad <img src="http://whocares.com" onerror="alert(document.cookie);">',
	}
	const expectedFolder = {
		id: 999,
		folder_name: 'Bad <img src="http://whocares.com">',
	}
	return {
		maliciousFolder,
		expectedFolder,
	}
}
module.exports = {
	makeMaliciousFolder,
	makeFoldersArray,
}
