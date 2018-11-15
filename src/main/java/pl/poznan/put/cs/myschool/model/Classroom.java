package pl.poznan.put.cs.myschool.model;

import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@Entity
public class Classroom {

    @Id
    private long number;

    @NotNull
    private int numberOfSeats;

    @OneToMany(mappedBy = "classroom")
    private List<Lesson> lessons;
}
