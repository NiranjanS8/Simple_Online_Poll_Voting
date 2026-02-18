package com.voting.votingapp.controller;


import com.voting.votingapp.model.Poll;
import com.voting.votingapp.request.Vote;
import com.voting.votingapp.service.PollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/polls")
public class PollController {

    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    @PostMapping
    public Poll createPoll(@RequestBody Poll poll){

        return pollService.createPoll(poll);
    }

    @GetMapping
    public List<Poll> getAllPoll(){

        return pollService.getAllPolls();
    }

    @GetMapping("/{pollId}")
    public ResponseEntity<Poll> getAllPoll(@PathVariable Long pollId){

        return pollService.getPollById(pollId).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/vote")
    public void  vote(@RequestBody Vote vote) throws IllegalAccessException {

        pollService.vote(vote.getPollId(),vote.getOptionIndex());
    }


}
