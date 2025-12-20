<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex justify-between gap-3 max-sm:flex-col sm:items-center">
      <div>
        <h2 class="text-xl font-bold">Manage Purchases</h2>
        <p class="text-muted-foreground max-w-3xl">
          View and manage all vehicle purchases. Track purchase history and
          manage your inventory acquisitions.
        </p>
      </div>
      <v-btn color="primary" :to="{ name: 'dealer.purchases.add' }" prepend-icon="mdi-plus">
        Add Purchase
      </v-btn>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">
          Purchases data table will be implemented here
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

