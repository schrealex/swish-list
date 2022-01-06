export type HLTBInfo = {
    id: string;
    name: string;
    searchTerm: string;
    description: string;
    imageUrl: string;
    gameplayCompletionist: number;
    gameplayMain: number;
    gameplayMainExtra: number;
    platforms: Array<string>;
    playableOn: Array<string>;
    timeLabels: Array<string>;
    similarity: number;
}
