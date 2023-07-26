"use client"

import { Box, Button, FormControl, FormLabel, Input, Textarea, Radio, RadioGroup, Stack, Heading } from "@chakra-ui/react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { UserData } from "@/type/user-data.type";
import { useGamerContext } from "@/context/gamer";
import Layout from "@/layout/Layout";

type FormData = {
    firstName: string;
    lastName: string;
    imageUrl: string;
    description: string;
    role: "master" | "player";
};

const Inscription = () => {
    const { register, handleSubmit, formState: { errors }, control } = useForm<FormData>();
    const router = useRouter();
    const { updateUser, currentUser } = useGamerContext();

    const onSubmit: SubmitHandler<FormData> = (data) => {
        console.log(data);
        if (currentUser) {
            const updatedUser: UserData = { ...currentUser, ...data };
            updateUser(updatedUser);
        }

        if (data.role === "master") {
            router.push("/master");
        } else if (data.role === "player") {
            router.push("/player");
        }
    };

    return (
        <Layout>
            <Box maxW="md" mx="auto" mt={5} p={6} rounded="lg" boxShadow="lg">
                <Heading mb={6}>Inscription</Heading>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl id="firstName" isRequired mb={4}>
                        <FormLabel>Prénom</FormLabel>
                        <Input type="text" {...register("firstName", { required: "Ce champ est requis" })} />
                        {errors.firstName && <span>{errors.firstName.message as any}</span>}
                    </FormControl>

                    <FormControl id="lastName" isRequired mb={4}>
                        <FormLabel>Nom</FormLabel>
                        <Input type="text" {...register("lastName", { required: "Ce champ est requis" })} />
                        {errors.lastName && <span>{errors.lastName.message as any}</span>}
                    </FormControl>

                    <FormControl id="imageUrl" isRequired mb={4}>
                        <FormLabel>URL de l'image</FormLabel>
                        <Input type="text" value='https://media.discordapp.net/attachments/1063223734976139294/1132962977553842267/xeonarno_minimal_line_logo_for_the_expression_BlockQuest_in_a_c_f325e07d-39e7-4141-b5b2-7419414b9a9b.png?width=1086&height=1086' {...register("imageUrl", { required: "Ce champ est requis" })} />
                        {errors.imageUrl && <span>{errors.imageUrl.message as any}</span>}
                    </FormControl>

                    <FormControl id="description" isRequired mb={4}>
                        <FormLabel>Description</FormLabel>
                        <Textarea {...register("description", { required: "Ce champ est requis" })} />
                        {errors.description && <span>{errors.description.message as any}</span>}
                    </FormControl>

                    <FormControl id="role" isRequired mb={4}>
                        <FormLabel>Rôle</FormLabel>
                        <Controller
                            control={control}  // de useForm()
                            name="role"
                            defaultValue="player"
                            rules={{ required: "Ce champ est requis" }}
                            render={({ field: { onChange, onBlur, value, name, ref } }) => (
                                <RadioGroup onChange={val => onChange(val as any)} onBlur={onBlur} value={value} >
                                    <Stack direction="row">
                                        <Radio value="master">Maître de jeu</Radio>
                                        <Radio value="player">Joueur</Radio>
                                    </Stack>
                                </RadioGroup>
                            )}
                        />
                        {errors.role && <span>{errors.role.message as any}</span>}
                    </FormControl>
                    <Button colorScheme="blue" type="submit">
                        S'inscrire
                    </Button>
                </form>
            </Box>
        </Layout>
    );
}

export default Inscription;
