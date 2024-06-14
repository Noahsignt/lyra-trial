// hard coded list of topics currently
const RecommendedTopics = () => {
    const hardCodedTopics = [
        'AI',
        'Blockchain',
        'Crypto',
        'DeFi',
        'The Daos',
        'Lyra',
        'NFTS',
        'USA'
    ]

    return (
        <div className="flex flex-col gap-2">
            <h1 className="font-medium py-2">
                Recommended Topics
            </h1>
            <div className="flex flex-row flex-wrap gap-3">
                {hardCodedTopics.map((topic, idx) => (
                    <div key={idx} className="cursor-not-allowed text-sm bg-black/5 py-2 px-4 rounded-full">{topic}</div>
                ))}
            </div>
        </div>
    )
}

export default RecommendedTopics;