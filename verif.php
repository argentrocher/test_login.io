<?php
$motdepasse1 = "m1"; // Le mot de passe attendu
$motdepasse2 = "m2"; // Le mot de passe attendu

if ($_POST["mdp"] === $motdepasse1 || $_POST["mdp"] === $motdepasse2) {
    // Si le mot de passe est bon, redirige vers la page secrète
    header("Location: https://argentrocher.github.io/calculateur_de_1.io/");
    exit();
} else {
    // Sinon, retourne à la page de login (GitHub Pages par exemple)
    header("Location: https://argentrocher.github.io/test_login.io/?error=1");
    exit();
}
?>
