package com.voting.votingapp.model;


import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@Embeddable
public class OptionVOte {

    private String voteOption;
    private Long voteCount = 0L;
}
