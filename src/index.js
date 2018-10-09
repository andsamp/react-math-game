import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import './index.css';


//http://bit.ly/c-pcs
var possibleCombinationSum = function (arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount; i++) {
        var combinationSum = 0;
        for (var j = 0; j < listSize; j++) {
            if (i & (1 << j)) { combinationSum += arr[j]; }
        }
        if (n === combinationSum) { return true; }
    }
    return false;
};

const Stars = (props) => {

    let stars = [];
    for (let i = 0; i < props.numberOfStars; i++) {
        stars.push(<i key={i} className="fa fa-star"></i>);
    }
    return (
        <div className="col-5">
            {stars}
        </div>
    );
}

const AnswerChecker = (props) => {
    let button;
    switch (props.answerIsCorrect) {
        case true:
            button = <button className="btn btn-success" onClick={props.acceptAnswer}><i className="fa fa-check"></i></button>
            break;
        case false:
            button = <button className="btn btn-danger"><i className="fa fa-times"></i></button>
            break;
        default:
            button =
                <button className="btn" onClick={props.checkAnswer} disabled={props.selectedNumbers.length === 0}>
                    =
                </button>;
            break;

    }

    return (
        <div className="col-2 text-center">
            {button}
            <br /><br />
            <button className="btn btn-warning btn-sm" onClick={props.useRefresh} disabled={props.remainingRefreshes === 0}>
                <i className="fa fa-sync"></i>{props.remainingRefreshes}
            </button>
        </div>
    )
}

const Answer = (props) => {
    return (
        <div className="col-5">
            {props.selectedNumbers.map((number, i) =>
                <span key={i} onClick={() => props.selectNumber(number)}>
                    {number}
                </span>)}
        </div>
    )
}

const GameState = (props) => {

    return (
        <div className="text-center">
            <h2>{props.gameStatus}</h2>
            <button className="btn btn-secondary" onClick={props.playAgain}>Play Again?</button>
        </div>
    );


}

const Numbers = (props) => {
    const numberClassName = (number) => {
        if (props.selectedNumbers.indexOf(number) >= 0) {
            return 'selected';
        }
        if (props.usedNumbers.indexOf(number) >= 0) {
            return 'used';
        }

    }

    return (
        <div className="card text-center">
            <div>
                {Numbers.list.map((number, i) =>
                    <span key={i} className={numberClassName(number)} onClick={() => props.selectNumber(number)}>
                        {number}
                    </span>)}
            </div>
        </div>
    )
}

Numbers.list = _.range(1, 10);

class Game extends React.Component {
    static randomNumber = () => 1 + Math.floor(Math.random() * 9);
    static initialState = () => ({
        answerIsCorrect: null,
        numberOfStars: Game.randomNumber(),
        selectedNumbers: [],
        usedNumbers: [],
        remainingRefreshes: 5,
        gameStatus: null,
    });
    state = Game.initialState();

    selectNumber = (clickedNumber) => {
        if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) { return; }
        if (this.state.usedNumbers.indexOf(clickedNumber) >= 0) { return; }
        this.setState(prevState => (
            {
                selectedNumbers: prevState.selectedNumbers.concat(clickedNumber),
                answerIsCorrect: null
            }
        ));
    };

    deselectNumber = (clickedNumber) => {
        this.setState(prevState => (
            {
                selectedNumbers: prevState.selectedNumbers.filter(number => number !== clickedNumber),
                answerIsCorrect: null
            }
        ));
    };

    checkAnswer = () => {
        this.setState(prevState => (
            {
                answerIsCorrect: prevState.numberOfStars ===
                    prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
            }
        ));
    }

    acceptAnswer = () => {
        this.setState(prevState => (
            {
                usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
                selectedNumbers: [],
                answerIsCorrect: null,
                numberOfStars: Game.randomNumber(),
            }
        ), this.updateGameStatus);
    }

    useRefresh = () => {
        if (this.state.remainingRefreshes === 0) { return; }
        this.setState(prevState => (
            {
                selectedNumbers: [],
                answerIsCorrect: null,
                numberOfStars: Game.randomNumber(),
                remainingRefreshes: prevState.remainingRefreshes - 1
            }
        ), this.updateGameStatus);
    }

    updateGameStatus = () => {
        this.setState(prevState => {
            if (prevState.usedNumbers === 9) {
                console.log("You Win!");
                return { gameStatus: 'You Won!' };
            }
            if (prevState.remainingRefreshes === 0 && !this.possibleSolutions(prevState)) {
                console.log("you lose.");
                return { gameStatus: 'Game Over...' };
            }
        });
    }

    possibleSolutions = (state) => {
        const possibleNumbers = _.range(1, 10).filter(number => state.usedNumbers.indexOf(number) === -1);

        return possibleCombinationSum(possibleNumbers, state.numberOfStars);
    }

    playAgain = () => {
        this.setState(Game.initialState());
    }

    render() {
        return (
            <div>
                <h3>Play Nine</h3>
                <hr />
                <div className="row">
                    <Stars numberOfStars={this.state.numberOfStars} />
                    <AnswerChecker selectedNumbers={this.state.selectedNumbers}
                        checkAnswer={this.checkAnswer}
                        acceptAnswer={this.acceptAnswer}
                        useRefresh={this.useRefresh}
                        remainingRefreshes={this.state.remainingRefreshes}
                        answerIsCorrect={this.state.answerIsCorrect} />

                    <Answer selectedNumbers={this.state.selectedNumbers} selectNumber={this.deselectNumber} />
                </div>
                <hr />
                {this.state.gameStatus ? <GameState gameStatus={this.state.gameStatus} playAgain={this.playAgain}/> :
                    <Numbers selectedNumbers={this.state.selectedNumbers} usedNumbers={this.state.usedNumbers} selectNumber={this.selectNumber} />}


            </div>
        )
    }

}


class App extends React.Component {

    render() {
        return (
            <div className="container">
                <Game />
            </div>
        )
    }

}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);