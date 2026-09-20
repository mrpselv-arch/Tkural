package com.ext.techapp.thirukkural.preference;

import android.os.Bundle;
import android.view.MenuItem;

import androidx.appcompat.app.AppCompatActivity;
import androidx.preference.PreferenceManager;

import com.ext.techapp.thirukkural.R;

public class SettingsActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);
        setTitle(R.string.title_activity_settings);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        PreferenceManager.setDefaultValues(this, R.xml.preferences, false);

        if (savedInstanceState == null) {
            SettingsFragment settings = new SettingsFragment();
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.action_settings_layout, settings)
                    .commit();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}

