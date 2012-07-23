function Competition(numPlayers,userData) {
    this.numPlayers_ = numPlayers;
    this.userData_ = userData;

    this.categorisedUsers_ = {};

    this.states_ = ["waiting","opening","heat1","heat2","finals","podium"];

    for(var i=0; i<this.states_.length; i++) {
        this.categorisedUsers_[this.states_[i]] = {};
    }

    var i = 0;

    for(var userId in userData) {
        var currentState = {};
        if(i < 4) {
            currentState = this.categorisedUsers_[this.states_[2]];
        } else {
            currentState = this.categorisedUsers_[this.states_[3]];
        }

        currentState[userId] = userData[userId];

        i++;
    }

    this.stateIndex_ = 0;
};

Competition.prototype.getCurrentStage = function () {
    return this.states_[this.stateIndex_];
};

Competition.prototype.nextStage = function () {
    this.stateIndex_++;
    return;
};

Competition.prototype.getRacers = function () {
    return this.categorisedUsers_[this.states_[this.stateIndex_]];
};

Competition.prototype.setWinner = function (userId,stage) {
    var finalState = {};
    if(this.states_[this.stateIndex_].indexOf('heat') > 0) {
        finalState = this.categorisedUsers_[this.states_[4]];
        finalState[userId] = this.userData_[userId];
    } else if (this.states_[this.stateIndex_].indexOf('finals') > 0) {
        finalState = this.categorisedUsers_[this.states_[5]];
        finalState[userId] = this.userData_[userId];
    }
};