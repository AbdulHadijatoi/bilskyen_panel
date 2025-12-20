<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex justify-between gap-3 max-sm:flex-col sm:items-center">
      <div>
        <h2 class="text-xl font-bold">Chart of Accounts</h2>
        <p class="text-muted-foreground max-w-3xl">
          Manage your financial accounts and chart of accounts structure.
        </p>
      </div>
      <v-btn
        color="primary"
        :to="{ name: 'dealer.accounting.financial-accounts.add' }"
        prepend-icon="mdi-plus"
      >
        Add Financial Account
      </v-btn>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">
          Financial Accounts data table will be implemented here
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

