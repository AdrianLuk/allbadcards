import GameStart from "./GameStart";
import {RouteComponentProps, withRouter} from "react-router";
import React from "react";
import GameJoin from "./GameJoin";
import {gamesOwnedLsKey} from "../GameDashboard/GameDashboard";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {GamePlayWhite} from "./GamePlayWhite";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {GamePlayBlack} from "./GamePlayBlack";
import Helmet from "react-helmet";

interface IGameParams
{
	id: string;
}

interface IGameState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

class Game extends React.Component<RouteComponentProps<IGameParams>, IGameState>
{
	constructor(props: RouteComponentProps<IGameParams>)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state
		};
	}

	public componentDidMount(): void
	{
		GameDataStore.listen(data => this.setState({
			gameData: data
		}));

		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	private gameIsOwned(gameId: string)
	{
		const gamesOwnedString = localStorage.getItem(gamesOwnedLsKey) ?? "[]";
		const gamesOwned = JSON.parse(gamesOwnedString) as string[];
		return gamesOwned.includes(gameId);
	}

	public render()
	{
		const {
			id,
		} = this.props.match.params;

		const {
			started,
			chooserGuid,
			ownerGuid,
			players
		} = this.state.gameData.game ?? {};

		const {
			playerGuid
		} = this.state.userData;

		const owner = players?.[ownerGuid ?? ""];
		const isOwner = this.gameIsOwned(id);
		const isChooser = playerGuid === chooserGuid;
		const amInGame = playerGuid in (players ?? {});
		const title = `${owner?.nickname}'s game`;

		return (
			<>
				<Helmet>
					<title>{title}</title>
				</Helmet>
				{(!started || !amInGame) && (
					<BeforeGame gameId={id} isOwner={isOwner} />
				)}

				{started && amInGame && !isChooser && (
					<GamePlayWhite />
				)}

				{started && amInGame && isChooser && (
					<GamePlayBlack />
				)}
			</>
		);
	}
};

interface BeforeGameProps
{
	isOwner: boolean;
	gameId: string;
}
const BeforeGame: React.FC<BeforeGameProps> = (props) => {
	return (
		<>
			{props.isOwner && (
				<GameStart id={props.gameId}/>
			)}

			{!props.isOwner && (
				<GameJoin id={props.gameId}/>
			)}
		</>
	);
};

export default withRouter(Game);